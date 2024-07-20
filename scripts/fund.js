const {getNamedAccounts} = require("hardhat")

async function main() {
    deployer = (await getNamedAccounts()).deployer
    fundMe = await ethers.getContract("FundMe", deployer)
    console.log("deploying contract...")
    const txnResponse = await fundMe.fund({value: ethers.parseEther("0.1")})
    await txnResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })