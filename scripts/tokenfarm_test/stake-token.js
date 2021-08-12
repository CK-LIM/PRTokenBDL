const Web3 = require('web3');
const XToken = artifacts.require('XToken')
const TokenFarm = artifacts.require('TokenFarm')
const LPXToken = artifacts.require('LPXToken')

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

function wei(n) {
    return web3.utils.fromWei(n,'ether');
}

module.exports = async function (callback) {
    let xToken = await XToken.deployed()
    let lpXToken = await LPXToken.deployed()
    let tokenFarm = await TokenFarm.deployed()

    // Get account list
    let accounts = await web3.eth.getAccounts()
    // console.log('address account[0]'+accounts[0])
    // // result = await xToken.balanceOf(accounts[0])
    // // console.log('xToken account[0]:'+ wei(result))
    let start = 1
    let index = 400

    // Staking token part
    for (let i = start; i < index; i++) {
        console.log(accounts[i])
        // result = await xToken.balanceOf(accounts[i])
        // console.log(wei(result))
        // result = await web3.eth.getBalance(accounts[i])
        // console.log(wei(result))
        // await web3.eth.personal.unlockAccount(accounts[i])  //truffle development RPC unlock
        await xToken.approve(tokenFarm.address, tokens('10'), { from: accounts[i] })
        console.log('done')
        await tokenFarm.stakeTokens(tokens('10'), ({ from: accounts[i], gas: 7721975 }))
        console.log('user'+i+' done staking')
    }
    await tokenFarm.updateRewardTokens({ from: accounts[0] })
    callback()
}