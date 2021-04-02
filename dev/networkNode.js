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
  const { amount, sender, recipient } = req.body;
  const blockIndex = bc.createNewTransaction(amount, sender, recipient);
  res.json(`Transaction to be added to block ${blockIndex}`);
});

app.get("/mine", (req, res) => {
  const { hash: prevBlockHash, index } = bc.getLastBlock();
  const currBlockData = {
    transactions: bc.pendingTransactions,
    index: index + 1,
    // anything else
  };
  const nonce = bc.proofOfWork(prevBlockHash, currBlockData);
  const currBlockHash = bc.hashBlock(prevBlockHash, currBlockData, nonce);

  bc.createNewTransaction({
    amount: REWARD,
    sender: "00",
    recipient: nodeAddress,
  });

  // credit account
  const newBlock = bc.createNewBlock(nonce, prevBlockHash, currBlockHash);
  // return last block
  res.json({ message: "New block successfully created!", newBlock });
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
