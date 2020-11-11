
const e = require('express');
const uuid = require('uuid');
const { verifySignature } = require('../util');

class Transaction {
    constructor({ senderWallet, recipient, amount }) {
        this.id = uuid.v1();
        this.outputMap = this.createOutputMap({ 
            senderWallet, 
            recipient, 
            amount 
        });

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    static validTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction;
        
        // Reconstruct total amount from recipients' values.
        const outputTotal = Object.values(outputMap).reduce(
            (total, outputAmount) => total + outputAmount
        );

        // Check if the sum of all outputMap recipient values matches
        // the input amount.
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }

    update({ senderWallet, recipient, amount }) {
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }
        
        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] += amount;
        }
        
        this.outputMap[senderWallet.publicKey] -= amount;

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }
}

module.exports = Transaction;