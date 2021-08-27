const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

// const LPXToken = artifacts.require("LPXToken.sol");
// const XToken = artifacts.require("XToken.sol");
// const PurseToken = artifacts.require("PurseToken.sol")
// const PurseTokenMultiSig = artifacts.require("PurseTokenMultiSig.sol")
const PurseTokenMultiSigUpgradable = artifacts.require("PurseTokenMultiSigUpgradable.sol")
// const PurseTokenMultiSigUpgradableV2 = artifacts.require("PurseTokenMultiSigUpgradableV2.sol")
// const TokenFarm = artifacts.require("TokenFarm.sol");
// const NPXSXEMToken = artifacts.require("NPXSXEMToken.sol")
// // const NPXSXEMigration = artifacts.require("NPXSXEMigration.sol")
const NPXSXEMigrationMulSig = artifacts.require("NPXSXEMigrationMulSig.sol")
// const BridgeEth = artifacts.require('BridgeEth.sol');
// const BridgeBsc = artifacts.require('BridgeBsc.sol');
const PurseDistribution = artifacts.require('PurseDistribution.sol');



function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

module.exports = async function(deployer, network, accounts ) {
  if(network === 'rinkeby' || network === 'kovan' || network === 'development' || network ==='bscTestnet') {

    //Deploy PurseToken
    // await deployer.deploy(PurseTokenMultiSigUpgradable, "0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217",["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x9204Da1b7bC4E3Bf4d4E3f5d71d9432b561c4f5D"], 1, "0x7619Ef7A7F5e424B36cF4058F35B57674d7D3249", "0x5bf4c0e90cc59DefF6787f7080b91A9fa7421828", 20, 10, 5, 5)
    // const purseToken = await PurseTokenMultiSigUpgradable.deployed()

    const purseToken = await deployProxy(PurseTokenMultiSigUpgradable,["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217",["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"], 1, "0xA2993e1171520ba0fD0AB39224e1B24BDa5c24a9", "0x96C235003CEDd5E4C055aA0Ac624BF7CC787cF80", 20, 10, 5, 5],{deployer, kind: 'uups' });
    // const upgraded = await upgradeProxy(purseToken.address, PurseTokenMultiSigUpgradableV2, { deployer });
    console.log(purseToken.address)
  
    //Deploy NPXSXEMigrationMulSig
    await deployer.deploy(NPXSXEMigrationMulSig, purseToken.address, ["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"],["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"], 1)
    const npxsxeMigrationMulSig = await NPXSXEMigrationMulSig.deployed()    

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed() 

    await purseToken.transfer(npxsxeMigrationMulSig.address, tokens('500000000'))
    console.log('Purse done')
    await purseToken.transfer(purseDistribution.address, tokens('19237401614'))    
    console.log('Purse done')


  }

  if(network === 'ghgh') {

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
    await deployer.deploy(NPXSXEMigrationMulSig, purseToken.address, ["0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf", "0xA2993e1171520ba0fD0AB39224e1B24BDa5c24a9"],["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x96C235003CEDd5E4C055aA0Ac624BF7CC787cF80"], 2)
    const npxsxeMigrationMulSig = await NPXSXEMigrationMulSig.deployed()

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed()  

    // Transfer all purse tokens to TokenFarm
    await purseToken.transfer(tokenFarm.address, tokens('50000000'))
    console.log('Purse done')
    await purseToken.transfer(npxsxeMigrationMulSig.address, tokens('500000000'))
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
