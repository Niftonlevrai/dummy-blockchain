const Block = require('./block')
const cryptoHash = require('./crypto-hash')

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

    static isValidChain(chain) {
        // Check if the first block is the genesis block.
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }
        for (let blockIdx = 1; blockIdx < chain.length; blockIdx++) {
            const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[blockIdx];
            const actualLastHash = chain[blockIdx - 1].hash;
            // Check if the hash of the previous block is equal to the lastHash
            // of current block.
            if (lastHash !== actualLastHash) return false;
            
            // Check if block data is valid by computing the hash.
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) return false;
        }
        return true;
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer than current chain.');
            return;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid.');
            return;
        }
        
        console.log('Replacing chain with', chain);
        this.chain = chain;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
}

module.exports = Blockchain;