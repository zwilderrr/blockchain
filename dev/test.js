import Blockchain from "./blockchain.js";

const bc = new Blockchain();

const pBH = "1324";
const currBlockData = [
  {
    amount: 234,
    from: "hey",
    to: "yo",
  },
];

const nonce = 1234;

console.log(bc.proofOfWork(pBH, currBlockData));
