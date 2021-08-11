const XToken = artifacts.require('XToken')
const TokenFarm = artifacts.require('TokenFarm')
const LPXToken = artifacts.require('LPXToken')

// let accounts = [];

let start = 148
let index = 151

// for (let i = 0; i < index; i++) {
//     const { address: account } = web3Eth.eth.accounts.wallet.add(Prikeys[i]);
//     accounts[i] = account;
//     console.log(accounts[i])
// }

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
    let accounts = await web3.eth.getAccounts()
    console.log('address account[0]'+accounts[0])
    // result = await xToken.balanceOf(accounts[0])
    // console.log('xToken account[0]:'+ wei(result))

    // Extract stakerInfo data
    for (let i = start; i < index; i++) {
        stakerInfo = await tokenFarm.stakerInfo(accounts[i])
        console.log('address account'+i+accounts[i])
        console.log('Staking Block account'+i+': ' +stakerInfo.stakingBlock)
        // console.log('Reward Balance account'+i+': '+wei(stakerInfo.rewardBalance))
        // console.log('Pool Share Ratio account'+i+': '+stakerInfo.poolShareRatio.toString())
    }
    callback()
}