const Web3 = require('web3');
const XToken = artifacts.require('XToken')
const TokenFarm = artifacts.require('TokenFarm')
const LPXToken = artifacts.require('LPXToken')

const infuraKey = "4f60244fe0ed4c24976d4bedbaf22222";
const web3Eth = new Web3(`https://rinkeby.infura.io/v3/${infuraKey}`);            // http provider not supported 

const Prikeys = ['']

let accounts = [];
let index = 3

for (let i = 0; i < index; i++) {
    const { address: account } = web3Eth.eth.accounts.wallet.add(Prikeys[i]);
    accounts[i] = account;
    console.log(accounts[i])
}

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

function wei(n) {
    return web3.utils.fromWei(n, 'ether');
}

module.exports = async function (callback) {
    let xToken = await XToken.deployed()
    let lpXToken = await LPXToken.deployed()
    let tokenFarm = await TokenFarm.deployed()

    // Transfer token part
    for (let i = 1; i < index; i++) {
        result = await xToken.balanceOf(accounts[0])
        console.log(wei(result))
        await xToken.transfer(accounts[i], tokens('10'))
        console.log('accounts' +i+ ' done transfer')
        result = await xToken.balanceOf(accounts[i])
        console.log('xToken account' + i + ':' + wei(result))
    }

    // Staking token part
    for (let i = 1; i < index; i++) {
        await xToken.approve(tokenFarm.address, tokens('10'), { from: accounts[i] })
        await tokenFarm.stakeTokens(tokens('10'), { from: accounts[i] })
        console.log('accounts' + i + ' done staking')
    }

    // Extract stakerInfo data
    for (let i = 1; i < index; i++) {
        stakerInfo = await tokenFarm.stakerInfo(accounts[i])
        console.log('Staking Balance account' + i + ': ' + wei(stakerInfo.stakingBalance))
        console.log('Reward Balance account' + i + ': ' + wei(stakerInfo.rewardBalance))
        console.log('Pool Share Ratio account' + i + ': ' + stakerInfo.poolShareRatio.toString())
    }


    callback()
}