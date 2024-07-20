const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe, deployer, mockV3Aggregator
        const sendValue = ethers.parseEther("1") //converts it into 1000000000000000000 (18 0's)
        beforeEach(async function () {
            // deploy our fundMe contract using hardhat-deploy
            // we will specify our metamask account here (like we did in deploy script)
            // const accounts = await ethers.getSigners() // gets all the accounts
            // const accountZero = accounts[0]

            // const { deployer } = await getNamedAccounts()
            // since we want deployer out of this scope, we do
            deployer = (await getNamedAccounts()).deployer
            // fixture allows us to run our deploy folder with as many tags as we want
            await deployments.fixture(["all"])
            // gets us the most recently deployed FundMe contract
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await deployments.get("MockV3Aggregator")
        })
        describe("constructor", async function () {
            // just test the constructor
            it("Sets the Aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async function () {
            //tests the min USD condition
            it("Fails if you don't send enough ETH", async function () {
                // we're using waffles here to make sure if the contract fails, the test is okay
                // since we're testing the failing conditions for the contract
                await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough money!")
            })
            it("Updates the amount funded data structure", async function () {
                await fundMe.fund({value: sendValue})
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Adds funder to array of funder", async function () {
                await fundMe.fund({value: sendValue})
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer)
            })
        })
        describe("withdraw", async function () {
            //we need to fund the contract before withdrawing
            beforeEach(async function () {
                await fundMe.fund({value: sendValue})
            })
            it("Withdraws ETH from a single founder", async function () {
                // Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                // gasCost
                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Assert
                // our deployer also spent some gas to do these txn
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    (startingFundMeBalance + startingDeployerBalance).toString(), 
                    (endingDeployerBalance + gasCost).toString()
                )
            })
            it("Allows us to withdraw with multiple funders", async function () {
                // get signer accounts in ethers
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++){
                    // right now our fundMe is connected to deployer account
                    // to use these accounts, we need to connect it to these accounts
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value:sendValue})
                    const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                    const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                    //Act
                    const transactionResponse = await fundMe.withdraw()
                    const transactionReceipt = await transactionResponse.wait(1)
                    // gasCost
                    const { gasUsed, gasPrice } = transactionReceipt
                    const gasCost = gasUsed * gasPrice
                    const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                    const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                    // Assert
                    assert.equal(endingFundMeBalance, 0)
                    assert.equal(
                        (startingFundMeBalance + startingDeployerBalance).toString(), 
                        (endingDeployerBalance + gasCost).toString()
                    )

                    // make sure the funders array is reset properly
                    // check for an index that shouldn't exist
                    await expect(fundMe.getFunder(0)).to.be.reverted

                    // also check if the amountToFunders array have amount as 0 for these funders
                    for ( let i = 0; i < 6; i++){
                        assert.equal(
                            await fundMe.getAddressToAmountFunded(accounts[i].address),
                            0
                        )
                    }
                }
            })
            it("Only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[2]
                const attackerConnectedContract = await fundMe.connect(attacker)
                // revert with our custom error code - revertedWith doesn't work for custom errors
                await expect(attackerConnectedContract.withdraw()).to.be.rejectedWith("FundMe_NotOwner")
                assert.notEqual(attacker.address, fundMe.i_owner)
            })
            it("Allows us to withdraw from cheaperWithdraw func", async function () {
                // get signer accounts in ethers
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++){
                    // right now our fundMe is connected to deployer account
                    // to use these accounts, we need to connect it to these accounts
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value:sendValue})
                    const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                    const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                    //Act
                    const transactionResponse = await fundMe.cheaperWithdraw()
                    const transactionReceipt = await transactionResponse.wait(1)
                    // gasCost
                    const { gasUsed, gasPrice } = transactionReceipt
                    const gasCost = gasUsed * gasPrice
                    const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                    const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                    // Assert
                    assert.equal(endingFundMeBalance, 0)
                    assert.equal(
                        (startingFundMeBalance + startingDeployerBalance).toString(), 
                        (endingDeployerBalance + gasCost).toString()
                    )

                    // make sure the funders array is reset properly
                    // check for an index that shouldn't exist
                    await expect(fundMe.getFunder(0)).to.be.reverted

                    // also check if the amountToFunders array have amount as 0 for these funders
                    for ( let i = 0; i < 6; i++){
                        assert.equal(
                            await fundMe.getAddressToAmountFunded(accounts[i].address),
                            0
                        )
                    }
                }
            })
        })
    })