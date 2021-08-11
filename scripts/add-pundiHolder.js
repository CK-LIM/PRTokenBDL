const Web3 = require('web3');
const PurseDistribution = artifacts.require('PurseDistribution')
const fs = require('fs');

let rawdata = fs.readFileSync('../avg_balance_test.json');
var holder = JSON.parse(rawdata);
var keys = Object.keys(holder);
console.log(keys)
console.log(holder["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217"]);
const privKey = '';
function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

function wei(n) {
    return web3.utils.fromWei(n,'ether');
}

module.exports = async function (callback) {
    let purseDistribution = await PurseDistribution.deployed()
    // console.log(purseDistribution)
    let address = await purseDistribution.address
    console.log(address)

    // Get account list
    let accounts = await web3.eth.getAccounts()
    console.log('address account[0]'+accounts[0])
    // // result = await xToken.balanceOf(accounts[0])
    // // console.log('xToken account[0]:'+ wei(result))
    let start = 0
    let index = 3

    // Staking token part
    for (let i = start; i < keys.length; i++) {
        holderadd = holder[keys[i]]
        console.log(holderadd)
        console.log(keys[i])
        await purseDistribution.updateHolderInfo(holderadd,10), ({ from: accounts[0] })
        let holderInfo = await purseDistribution.holder(accounts[i], 1)
        console.log(holderInfo)
        console.log('user'+i+' done adding')
    }

    callback()
}