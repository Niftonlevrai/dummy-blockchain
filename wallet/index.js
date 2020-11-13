const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        
        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ amount, recipient }) {
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({
            senderWallet: this, 
            recipient, 
            amount
        });
    }

    static calculateBalance({ chain, address }) {
        let outputsTotal = STARTING_BALANCE;
        
        for (let idx = 1; idx < chain.length; idx++) {
            const block = chain[idx];

            for (let transaction of block.data) {
                const addressOuput = transaction.outputMap[address];

                if (addressOuput) {
                    outputsTotal += addressOuput;
                }
            }
        }
        
        return outputsTotal;
    }
}

module.exports = Wallet;