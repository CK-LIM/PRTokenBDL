// Run truffle execute ./scripts/PurseReward/add-pundiHolder.js --network bscTestnet

const Web3 = require('web3');
const PurseDistribution = artifacts.require('PurseDistribution.sol');
const PurseToken = artifacts.require('PurseTokenUpgradable.sol');
const fs = require('fs');

// Read json file
let rawkey = fs.readFileSync('../../avgfinalbalancekey.json');
const key = JSON.parse(rawkey);
let rawvalue = fs.readFileSync('../../avgfinalbalancevalue.json');
const value = JSON.parse(rawvalue);

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

function wei(n) {
    return web3.utils.fromWei(n,'ether');
}
i=0
module.exports = async function (callback) {

    let purseDistribution = await PurseDistribution.deployed()
    console.log(purseDistribution.address)
    console.log(key)

    let start = 0
    let holdersJson = []
    let valuesJson = []

    while (key.length> 0) {

        let owner = await purseDistribution.owner()
        console.log(owner)
        // console.log(key)
        holders = key.splice(0,249)         //max javascript tx ard 249
        holdersJson = JSON.stringify(holders)
        values = value.splice(0,249)
        valuesJson = JSON.stringify(values)
        fs.writeFileSync("holders.json",holdersJson+"\r\n"+"\r\n", {'flag':'a'});
        fs.writeFileSync("values.json",valuesJson+"\r\n"+"\r\n", {'flag':'a'});

        console.log("start")
        await purseDistribution.addHolderInfo(holders, values, 0).then(function (result) {
            console.log(result)})

        console.log('group'+i+' done adding')
        i +=1
    }
    

    callback()
}