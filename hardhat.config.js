require("@nomicfoundation/hardhat-ethers")
require("hardhat-deploy-ethers")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-verify")
require("dotenv").config()
require("@nomicfoundation/hardhat-chai-matchers")
require("solidity-coverage")
require("hardhat-gas-reporter")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY || "key"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.8.0" }],
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            ChainId: 11155111,
            blockConfirmations: 6 //blocks to wait after the contract is deployed
        },
    },
    gasReporter: {
        enabled: true,
        coinmarketcap: COINMARKET_API_KEY,
        noColors: true,
        outputFile: "gas-report.txt",
        currency: "INR",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // means that default account is at index 0 of accounts[]
            31337: 1, // means that at hardhat deployer account is 1
        },
    },
}
