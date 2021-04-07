import Blockchain from "./blockchain.js";

const bc = new Blockchain();

const chain = {
  chain: [
    {
      index: 1,
      timestamp: 1617758079208,
      transactions: [],
      nonce: 0,
      prevBlockHash: "0000000",
      hash: "0",
    },
    {
      index: 2,
      timestamp: 1617758093448,
      transactions: [],
      nonce: 192133,
      prevBlockHash: "0",
      hash: "000073e7d35d35be0861f043cae54db47715fe0d145fd49bd5964140949f2a31",
    },
    {
      index: 3,
      timestamp: 1617758097310,
      transactions: [
        {
          amount: 6,
          sender: "Coinbase",
          recipient: "e91fedc9a12b45c3b41043e69c5fd294",
          transactionId: "abfea964a3a440558aed47c9a970276d",
        },
      ],
      nonce: 145965,
      prevBlockHash:
        "000073e7d35d35be0861f043cae54db47715fe0d145fd49bd5964140949f2a31",
      hash: "0000a25f5b2bcb403359d87adc532a0d0ca92ef8ff38c295614779f68e35ecba",
    },
    {
      index: 4,
      timestamp: 1617758109900,
      transactions: [
        {
          amount: 6,
          sender: "Coinbase",
          recipient: "e91fedc9a12b45c3b41043e69c5fd294",
          transactionId: "779531a89ac848d597d678a8a57f0a79",
        },
        {
          amount: 20,
          sender: "zack",
          recipient: "avigail",
          transactionId: "62272e163f5c453b93455d8db6c41adc",
        },
        {
          amount: 20,
          sender: "zack",
          recipient: "avigail",
          transactionId: "35957e76c6194200a4b04ca7cc3e6f3d",
        },
        {
          amount: 20,
          sender: "zack",
          recipient: "avigail",
          transactionId: "cef219a597df4acd8779d4b6e0822b1f",
        },
      ],
      nonce: 24316,
      prevBlockHash:
        "0000a25f5b2bcb403359d87adc532a0d0ca92ef8ff38c295614779f68e35ecba",
      hash: "0000825bfef5b1d64ccbc0aca56c4289cb9b9a148f68811c68293e5e38dfe68f",
    },
  ],
  pendingTransactions: [
    {
      amount: 6,
      sender: "Coinbase",
      recipient: "e91fedc9a12b45c3b41043e69c5fd294",
      transactionId: "55763d8112004dc2bd1a9153deea0a44",
    },
  ],
  currentNodeUrl: "http://localhost:3001",
  networkNodes: [],
};

console.log(bc.chainIsValid(chain.chain));
