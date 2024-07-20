// mock script to simulate contracts locally
const { network } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        log("--------------------------------------")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER] // look through the mock sol to find out
        })
        log("Mocks Deployed!")
        log("------------------------------------")
    }
}

// run only deploy 
// gets activated when we call npx hardhat deploy --tags mocks
// runs only deploy scripts with specified tags
module.exports.tags = ["all", "mocks"]
