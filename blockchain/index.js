const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);
    }

    validTransactionData({ chain }) {
        for (let idx = 1; idx < chain.length; idx++) {
            const block = chain[idx];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    // Transaction data should contain only one reward transaction.
                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit.');
                        return false;
                    }

                    // A reward transaction contains only one recipient.
                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid.');
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction.');
                        return false;
                    }

                    // Get the true balance of the sender wallet, based on the chain history.
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    // The trueBalance should be equal to the transaction input amount.
                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount.');
                        return false;
                    }

                    // Check for duplicate transactions.
                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block.');
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }

                }
            }
        }

        return true;
    }

    static isValidChain(chain) {
        // Check if the first block is the genesis block.
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }
        for (let blockIdx = 1; blockIdx < chain.length; blockIdx++) {
            const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[blockIdx];
            const actualLastHash = chain[blockIdx - 1].hash;
            const lastDifficulty = chain[blockIdx - 1].difficulty;
            // Check if the hash of the previous block is equal to the lastHash
            // of current block.
            if (lastHash !== actualLastHash) return false;
            
            // Check if block data is valid by computing the hash.
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) return false;

            // Check the difficulty difference. It should not be more than 1.
            if (Math.abs(lastDifficulty - difficulty > 1)) return false;
        }
        return true;
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer than current chain.');
            return;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid.');
            return;
        }
        
        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error('The incoming chain has invalid transaction data.');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
}

module.exports = Blockchain;