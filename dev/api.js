import express from "express";
import bodyParser from "body-parser";
import Blockchain from "./blockchain.js";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());
const REWARD = 6;
const nodeAddress = uuidv4().split("-").join("");
// app.use(bodyParser.urlencoded({ extended: false }));

const bc = new Blockchain();

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
  console.log(bc.getLastBlock());
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

  const newBlock = bc.createNewBlock(nonce, prevBlockHash, currBlockHash);
  // credit account
  // return last block
  res.json({ note: "New block successfully created!", newBlock });
});

app.listen(3000, () => console.log("Listening on port 3000!"));
