const Transaction = require('../wallet/transaction');

class TransactionMiner {

    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // Extract the valid transactions from the pool.
        const validTransactions = this.transactionPool.validTransactions();
        // Generate the miner's reward.
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this. wallet })
        );
        // Add the block to the blockchain.
        this.blockchain.addBlock({ data: validTransactions });
        // Broadcast the updated blockchain.
        this.pubsub.broadcastChain();
        // Clear transaction pool.
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;