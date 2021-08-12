const Web3 = require('web3');
const PurseDistribution = artifacts.require('PurseDistribution')
const fs = require('fs');

// import account
const Prikeys = '54dad62968e13d682a4d01884cbedb95835dbd2d72cee7063d6e9e92558ee8a4'
const { address: account } = web3.eth.accounts.wallet.add(Prikeys);
// console.log(account)


// Read csv file
let rawdata = fs.readFileSync('../avg_balance_test.json');
var holder = JSON.parse(rawdata);
var keys = Object.keys(holder);

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

function wei(n) {
    return web3.utils.fromWei(n,'ether');
}

module.exports = async function (callback) {
    let purseDistribution = await PurseDistribution.deployed()

    // Get account list
    // let accounts = await web3.eth.getAccounts()
    // console.log('address account[0]'+accounts[0])
    let start = 1

    // Staking token part
    for (i = start; i < keys.length; i++) {
        let address = await purseDistribution.address
        console.log(address)
        holderBal = BigInt(holder[keys[i]])
        console.log(holderBal)
        transferAmount = BigInt(holderBal / 258491637n * 19237401613n)
        console.log(transferAmount)
        if (holderBal > 0) {
            await purseDistribution.updateHolderInfoFirst(keys[i], transferAmount), ({ from: account })
            let holderInfo = await purseDistribution.holder(keys[i], 1)
            console.log(holderInfo)
        }
        console.log('user'+i+' done adding')
    }
    callback()
}