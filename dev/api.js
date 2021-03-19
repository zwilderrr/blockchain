import express from "express";
import bodyParser from "body-parser";
import Blockchain from "./blockchain.js";

const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

const bc = new Blockchain();

app.get("/blockchain", (req, res) => {
  res.send(bc);
});

app.post("/transaction", (req, res) => {
  const { amount, sender, recipient } = req.body;
  const blockIndex = bc.createNewTransaction(amount, sender, recipient);
  res.send(`Transaction to be added to block ${blockIndex}`);
});

app.get("/mine", (req, res) => {});

app.listen(3000, () => console.log("Listening on port 3000!"));
