const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    // getNamedAccounts => hre.getNamedAccounts, deployments => hre.deployments
    const { deploy, log } = deployments
    // getting the deployer account from named accounts
    const { deployer } = await getNamedAccounts()

    //if contract doesn't exist, we deploy a minimal version for our local testing
    // use mock when going for local/hardhat network
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.name]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // constructor args -> priceFeedAddress in this case
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, // wait for block confirmations to index our txn
    })

    // verify our contract if network is not local
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("---------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
