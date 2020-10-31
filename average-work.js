const Block = require('./block');
const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({ data: 'initial' });

console.log('first block', blockchain.getLastBlock());

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, averageTime;

const times = [];

for (let i = 0; i < 10000; i++) {
    prevTimestamp = blockchain.getLastBlock().timestamp;
    blockchain.addBlock({ data: `block ${i}` });
    nextBlock = blockchain.getLastBlock();
    
    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);

    averageTime = times.reduce((total, num) => (total + num))/times.length;

    console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${averageTime}ms.`);
}
