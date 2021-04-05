import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";

export default class Blockchain {
  constructor(currentNodeUrl) {
    this.chain = [];
    // q for pending transactions that haven't been mined
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    // create genesis block
    this.createNewBlock(0, "0000000", "0");
  }

  // mine the block
  createNewBlock(nonce, prevBlockHash, hash) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      prevBlockHash,
      hash,
    };

    this.chain.push(newBlock);
    this.pendingTransactions = [];
    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(amount, sender, recipient) {
    const transactionId = uuidv4().split("-").join("");
    return { amount, sender, recipient, transactionId };
  }

  addTransactionToPendingTransactions(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock().index + 1;
  }

  hashBlock(prevBlockHash, currBlockData, nonce) {
    const dataAsString = prevBlockHash + JSON.stringify(currBlockData) + nonce;
    const hash = sha256(dataAsString);
    return hash;
  }

  proofOfWork(prevBlockHash, currBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(prevBlockHash, currBlockData, nonce);
    while (hash.slice(0, 4) !== "0000") {
      nonce++;
      hash = this.hashBlock(prevBlockHash, currBlockData, nonce);
    }

    // return [hash, nonce]?
    return nonce;
  }
}
