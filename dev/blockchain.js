import sha256 from "sha256";

export default class Blockchain {
  constructor() {
    this.chain = [];
    // q for pending transactions that haven't been mined
    this.pendingTransactions = [];
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
    const next = { amount, sender, recipient };
    this.pendingTransactions.push(next);

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

    return nonce;
  }
}
