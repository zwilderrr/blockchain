import express from "express";
import bodyParser from "body-parser";
import Blockchain from "./blockchain.js";
import { v4 as uuidv4 } from "uuid";
import rp from "request-promise";

const app = express();

const REWARD = 6;
const nodeAddress = uuidv4().split("-").join("");
const port = process.argv[2];
const currentNodeUrl = process.argv[3];

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bc = new Blockchain(currentNodeUrl);

app.get("/blockchain", (req, res) => {
  res.json(bc);
});

app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const blockIndex = bc.addTransactionToPendingTransactions(newTransaction);
  res.json(`Transaction to be added to block ${blockIndex}`);
});

app.post("/transaction/broadcast", (req, res) => {
  const newTransaction = bc.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );

  bc.addTransactionToPendingTransactions(newTransaction);

  const regNodePromises = [];
  bc.networkNodes.forEach(node => {
    const options = {
      uri: node + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };
    regNodePromises.push(rp(options));
  });

  Promise.all(regNodePromises).then(_ =>
    res.json({ message: "Transaction created and broadcast successfully" })
  );
});

app.get("/mine", (req, res) => {
  const { hash: prevBlockHash, index } = bc.getLastBlock();
  const currBlockData = {
    transactions: bc.pendingTransactions,
    index: index + 1,
  };
  const nonce = bc.proofOfWork(prevBlockHash, currBlockData);
  const currBlockHash = bc.hashBlock(prevBlockHash, currBlockData, nonce);

  const newBlock = bc.createNewBlock(nonce, prevBlockHash, currBlockHash);

  const reqPromises = [];
  bc.networkNodes.forEach(node => {
    const options = {
      uri: node + "/receive-new-block",
      method: "POST",
      body: { newBlock },
      json: true,
    };

    reqPromises.push(rp(options));
  });

  Promise.all(reqPromises)
    .then(_ => {
      // credit account
      const options = {
        uri: bc.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: REWARD,
          sender: "00",
          recipient: nodeAddress,
        },
        json: true,
      };

      return rp(options);
    })
    .then(_ => {
      res.json({ message: "New block successfully created!", newBlock });
    });
  // return last block
});

app.post("/receive-new-block", (req, res) => {
  const { newBlock } = req.body;
  debugger;
  const lastBlock = bc.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.prevBlockHash;
  const correctIndex = lastBlock.index + 1 === newBlock.index;

  // add a check to make sure it hash's correctly
  if (correctHash && correctIndex) {
    bc.createNewBlock(newBlock.nonce, newBlock.prevBlockHash, newBlock.hash);
    res.json({ message: "New block accepted", newBlock });
  } else {
    res.json({ message: "New block rejected", newBlock });
  }
});

app.post("/register-and-broadcast-node", (req, res) => {
  const { newNodeUrl } = req.body;
  if (!bc.networkNodes.includes(newNodeUrl)) {
    bc.networkNodes.push(newNodeUrl);
  }

  const regNodePromises = [];

  bc.networkNodes.forEach(nodeUrl => {
    const options = {
      uri: nodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl },
      json: true,
    };

    const p = rp(options);
    regNodePromises.push(p);
  });

  Promise.all(regNodePromises)
    .then(_ => {
      const options = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: { allNetworkNodes: [...bc.networkNodes, bc.currentNodeUrl] },
        json: true,
      };

      return rp(options);
    })
    .then(_ => res.json({ message: "New node registered successfully" }));
});

app.post("/register-node", (req, res) => {
  const { newNodeUrl } = req.body;
  if (
    !bc.networkNodes.includes(newNodeUrl) &&
    bc.currentNodeUrl !== newNodeUrl
  ) {
    bc.networkNodes.push(newNodeUrl);
  }
  res.json({
    message: `New node registered successfully with node ${currentNodeUrl}`,
  });
});

app.post("/register-nodes-bulk", (req, res) => {
  req.body.allNetworkNodes.forEach(node => {
    if (!bc.networkNodes.includes(node) && bc.currentNodeUrl !== node) {
      bc.networkNodes.push(node);
    }
  });
  res.json({
    message: `New node registered successfully with node ${currentNodeUrl}`,
  });
});

app.listen(port, () =>
  console.log(
    `${Date()
      .toString()
      .split(" ")
      .slice(0, 5)
      .join(" ")} Listening on port ${port}!`
  )
);

/**
curl --location --request POST 'http://localhost:3001/register-and-broadcast-node' \
--header 'Content-Type: application/json' \
--data-raw '{
    "newNodeUrl": "http://localhost:3002"
}'

curl --location --request POST 'http://localhost:3001/register-and-broadcast-node' \
--header 'Content-Type: application/json' \
--data-raw '{
    "newNodeUrl": "http://localhost:3003"
}'

curl --location --request POST 'http://localhost:3001/register-and-broadcast-node' \
--header 'Content-Type: application/json' \
--data-raw '{
    "newNodeUrl": "http://localhost:3004"
}'

curl --location --request POST 'http://localhost:3001/register-and-broadcast-node' \
--header 'Content-Type: application/json' \
--data-raw '{
    "newNodeUrl": "http://localhost:3005"
}'

*/
