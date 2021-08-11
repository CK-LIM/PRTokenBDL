const Web3 = require('web3');
const XToken = artifacts.require('XToken')
const LPXToken = artifacts.require('LPXToken')
const TokenFarm = artifacts.require('TokenFarm')

const Prikeys = ['']

let accounts = [];
let index = 5

for (let i = 0; i < index; i++) {
    const { address: account } = web3Eth.eth.accounts.wallet.add(Prikeys[i]);
    accounts[i] = account;
    console.log(accounts[i])
}

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
    // let account = await web3.eth.personal.getAccounts()
    // console.log(account)
    // let accounts = await web3.eth.getAccounts()
    // console.log(accounts[0])
    result = await xToken.balanceOf(accounts[0])
    console.log(wei(result))

    for (let i = 1; i < index; i++) {
        lpXTokenBalance = await lpXToken.balanceOf(accounts[i])
        await lpXToken.approve(tokenFarm.address, tokens(lpXTokenBalance), { from: accounts[i] })
        await tokenFarm.emergencyUnstakeTokens({ from: accounts[i] })
        console.log('user'+i+' done unstaking')
        result = await xToken.balanceOf(accounts[i])
        console.log(wei(result))
    }
    callback()
}