// if network is A, use address B
const networkConfig = {
    sepolia: {
        name: "sepolia",
        chainId: 11155111,
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000 // we chose 2000 then added 8 0's

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}
