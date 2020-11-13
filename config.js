const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const DIFFICULTY_SAFEGUARD = 1;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '*****',
    hash: 'genesis-hash',
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = {
    address: '*authorized-reward*'
};

const MINING_REWARD = 50;

module.exports = { 
    GENESIS_DATA, 
    MINE_RATE, 
    DIFFICULTY_SAFEGUARD,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};