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

  // chain is valid if it's the longest chain
  isValidChain(blockchain) {
    // check genesis block
    const genesisBlock = this.chain[0];
    if (
      genesisBlock.nonce !== 0 ||
      genesisBlock.prevBlockHash !== "0000000" ||
      genesisBlock.hash !== "0" ||
      genesisBlock.transactions.length !== 0
    ) {
      return false;
    }

    for (let i = 1; i < blockchain.length; i++) {
      const curr = blockchain[i];
      const prev = blockchain[i - 1];
      const blockData = {
        transactions: curr.transactions,
        index: curr.index,
      };
      const blockHash = this.hashBlock(prev.hash, blockData, curr.nonce);
      console.log(blockHash);
      if (blockHash.slice(0, 4) !== "0000") {
        return false;
      }
      if (curr.prevBlockHash !== prev.hash) {
        return false;
      }
    }

    return true;
  }
}
