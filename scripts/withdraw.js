const {getNamedAccounts} = require("hardhat")

async function main() {
    deployer = (await getNamedAccounts()).deployer
    fundMe = await ethers.getContract("FundMe", deployer)
    console.log("deploying contract...")
    // but if we already ran fund.js, it should already be funded
    const txnResponse = await fundMe.withdraw()
    await txnResponse.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })