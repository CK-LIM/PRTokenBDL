const LPXToken = artifacts.require("LPXToken.sol");
const XToken = artifacts.require("XToken.sol");
const PurseToken = artifacts.require("PurseToken.sol")
const TokenFarm = artifacts.require("TokenFarm.sol");
const NPXSXEMToken = artifacts.require("NPXSXEMToken.sol")
const NPXSXEMigration = artifacts.require("NPXSXEMigration.sol")
const BridgeEth = artifacts.require('BridgeEth.sol');
const BridgeBsc = artifacts.require('BridgeBsc.sol');
const PurseDistribution = artifacts.require('PurseDistribution.sol');


function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

module.exports = async function(deployer, network, accounts ) {
  if(network === 'rinkeby' || network === 'kovan' || network === 'development' || network ==='bscTestnet') {
    // Deploy Mock Dai Token
    await deployer.deploy(LPXToken)
    const lpXToken = await LPXToken.deployed()

    //Deploy XToken
    await deployer.deploy(XToken)
    const xToken = await XToken.deployed()

    //Deploy PurseToken
    await deployer.deploy(PurseToken)
    const purseToken = await PurseToken.deployed()

    //Deploy NPXSXEMToken
    await deployer.deploy(NPXSXEMToken)
    const npxsxemToken = await NPXSXEMToken.deployed()
  
    //Deploy TokenFarm
    await deployer.deploy(TokenFarm, xToken.address, lpXToken.address, purseToken.address, tokens('10'))
    const tokenFarm = await TokenFarm.deployed()

    //Deploy npxsxeMigration
    await deployer.deploy(NPXSXEMigration, purseToken.address)
    const npxsxeMigration = await NPXSXEMigration.deployed()

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed()    

    // Transfer all purse tokens to TokenFarm
    await purseToken.transfer(tokenFarm.address, tokens('50000000'))
    console.log('Purse done')
    await purseToken.transfer(npxsxeMigration.address, tokens('500000000'))
    console.log('Purse done')
    await purseToken.transfer(purseDistribution.address, tokens('19237401614'))    
    console.log('Purse done')

    //Deploy BridgeEth contract
    await deployer.deploy(BridgeEth, purseToken.address);
    const bridgeEth = await BridgeEth.deployed();
    await purseToken.updateAdmin(bridgeEth.address);
    
    // Transfer all lpX tokens to TokenFarm (1million)
    await lpXToken.transfer(tokenFarm.address, tokens('1000000'))
    console.log('lpX done')


    // Transfer 100 Mock X tokens to TokenFarm
    // await xToken.transfer(tokenFarm.address, tokens('10000'))
    // console.log('X1 done')
    await xToken.transfer(accounts[1], tokens('5000'))
    console.log('X2 done')
    // await xToken.transfer(accounts[2], tokens('5000'))
//    await xToken.transfer(accounts[3], tokens('5000'))


  }

  if(network === '') {

    // Deploy Mock Dai Token
    await deployer.deploy(LPXToken)
    const lpXToken = await LPXToken.deployed()

    //Deploy XToken
    await deployer.deploy(XToken)
    const xToken = await XToken.deployed()

    //Deploy PurseToken
    await deployer.deploy(PurseToken)
    const purseToken = await PurseToken.deployed()

    //Deploy NPXSXEMToken
    await deployer.deploy(NPXSXEMToken)
    const npxsxemToken = await NPXSXEMToken.deployed()
  
    //Deploy TokenFarm
    await deployer.deploy(TokenFarm, xToken.address, lpXToken.address, purseToken.address, tokens('10'))
    const tokenFarm = await TokenFarm.deployed()

    //Deploy npxsxeMigration
    await deployer.deploy(NPXSXEMigration, purseToken.address)
    const npxsxeMigration = await NPXSXEMigration.deployed()

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed()  

    // Transfer all purse tokens to TokenFarm
    await purseToken.transfer(tokenFarm.address, tokens('50000000'))
    console.log('Purse done')
    await purseToken.transfer(npxsxeMigration.address, tokens('500000000'))
    console.log('Purse done')
    await purseToken.transfer(purseDistribution.address, tokens('19237401614'))    
    console.log('Purse done')

    //Deploy BridgeBsc contract
    await deployer.deploy(BridgeBsc, purseToken.address);
    const bridgeBsc = await BridgeBsc.deployed();
    await purseToken.updateAdmin(bridgeBsc.address);
    
    // Transfer lpX tokens to TokenFarm (1million)
    await lpXToken.transfer(tokenFarm.address, tokens('1000000'))
    console.log('lpX done')

    // Transfer 100 Mock X tokens to TokenFarm
    // await xToken.transfer(tokenFarm.address, tokens('10000'))
    // console.log('X1 done')
    // await xToken.transfer(accounts[1], tokens('5000'))
    // console.log('X2 done')
    // await xToken.transfer(accounts[2], tokens('5000'))
//    await xToken.transfer(accounts[3], tokens('5000'))


  }
};
