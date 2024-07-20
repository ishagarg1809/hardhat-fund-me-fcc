const { getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
// let x = variable ? "yes": "no"
// if (variable) {x = "yes"} else {x = "no"}

developmentChains.includes(network.name) 
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe, deployer
        const sendValue = ethers.parseEther("0.1")
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
            // we don't need to add our mockv3aggregator since we will run this on testnet
        })
        it("Allows people to fund and withdraw", async function () {
            await fundMe.fund({value:sendValue})
            await fundMe.withdraw()
            const endingBalance = await ethers.provider.getBalance(fundMe.target)
            assert.equal(endingBalance.toString(), "0")
        })
    })