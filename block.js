
const hexToBinary = require('hex-to-binary');

const { GENESIS_DATA, MINE_RATE, DIFFICULTY_SAFEGUARD } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        let hash, timestamp, nonce = 0;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        
        do {
            // Nonce is incremented every loop until the hash contains a number
            // of leading zeros equal to the difficulty.
            nonce++;
            timestamp = Date.now();
            // Difficulty is incremented/decremented based on how much time it took to
            // mine the last block.           
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, lastHash, data, nonce, difficulty, hash });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;
        
        if (difficulty < DIFFICULTY_SAFEGUARD) return DIFFICULTY_SAFEGUARD;
        
        if ((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;

        return difficulty + 1;
    }
}

module.exports = Block;