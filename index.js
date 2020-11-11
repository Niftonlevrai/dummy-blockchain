const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const Transaction = require('./wallet/transaction');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;

    let transaction = transactionPool.existingTransaction({
        inputAddress: wallet.publicKey
    });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ amount, recipient });    
        }
        
    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    console.log('transactionPool', transactionPool);

    res.json({ type: 'success', transaction });
});

const syncChains = () => {
    // If the GET request is successful, replace the current chain with the 
    // parsed received chain.
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            
            console.log('Replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`)

    // New peers should synchronize with the current longest chain in the network.
    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }
});