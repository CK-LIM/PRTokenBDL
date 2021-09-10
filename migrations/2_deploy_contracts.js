// npx truffle migrate --reset --compile-all --network bscTestnet

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const NPXSXEMBSC = artifacts.require("NPXSXEMBSC.sol")

const PurseTokenUpgradable = artifacts.require("PurseTokenUpgradable.sol")
const PurseTokenUpgradableV2 = artifacts.require("PurseTokenUpgradableV2.sol")
const NPXSXEMigration = artifacts.require("NPXSXEMigration.sol")
const PurseDistribution = artifacts.require('PurseDistribution.sol');


function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

module.exports = async function(deployer, network, accounts ) {
  if(network === 'rinkeby' || network === 'kovan' || network ==='bscTestnet') {

    //Deploy PurseToken
    const purseToken = await deployProxy(PurseTokenUpgradable,["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0xA2993e1171520ba0fD0AB39224e1B24BDa5c24a9", "0x96C235003CEDd5E4C055aA0Ac624BF7CC787cF80", 10, 5, 5],{deployer, kind: 'uups' });
    // const upgrade = await upgradeProxy(purseToken.address, PurseTokenUpgradableV2, { deployer }); //Upgrade smart contract
    console.log(purseToken.address)
    // console.log(upgrade.address)

    await deployer.deploy(NPXSXEMBSC)
    const nPXSXEMBSC = await NPXSXEMBSC.deployed()
    
    //Deploy NPXSXEMigration
    await deployer.deploy(NPXSXEMigration, nPXSXEMBSC.address , purseToken.address)
    const nPXSXEMigration = await NPXSXEMigration.deployed()    

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed() 

    await purseToken.setWhitelistedFrom(nPXSXEMigration.address)
    await purseToken.setWhitelistedFrom(purseDistribution.address)
    await purseToken.transfer(nPXSXEMigration.address, tokens('500000000'))
    console.log('Purse done')
    await purseToken.transfer(purseDistribution.address, tokens('19237401614'))    
    console.log('Purse done')


  }

  if(network === 'development') {
    //Deploy PurseToken
    // await deployer.deploy(PurseTokenMultiSigUpgradable, "0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217",["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217", "0x9204Da1b7bC4E3Bf4d4E3f5d71d9432b561c4f5D"], 1, "0x7619Ef7A7F5e424B36cF4058F35B57674d7D3249", "0x5bf4c0e90cc59DefF6787f7080b91A9fa7421828", 20, 10, 5, 5)
    // const purseToken = await PurseTokenMultiSigUpgradable.deployed()

    const purseToken = await deployProxy(PurseTokenMultiSigUpgradable,["0x861eB8923dbeB383015864395891638Bd694C712", "0xA2993e1171520ba0fD0AB39224e1B24BDa5c24a9", "0x96C235003CEDd5E4C055aA0Ac624BF7CC787cF80", 10, 5, 5],{deployer, kind: 'uups' });
    // const upgraded = await upgradeProxy(purseToken.address, PurseTokenMultiSigUpgradableV2, { deployer });
    console.log(purseToken.address)
  
    //Deploy NPXSXEMigrationMulSig
    await deployer.deploy(NPXSXEMigrationMulSig, purseToken.address, ["0x861eB8923dbeB383015864395891638Bd694C712", "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"],["0x861eB8923dbeB383015864395891638Bd694C712", "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf"], 1)
    const npxsxeMigrationMulSig = await NPXSXEMigrationMulSig.deployed()    

    // Deploy PurseDistribution
    await deployer.deploy(PurseDistribution, purseToken.address)
    const purseDistribution = await PurseDistribution.deployed() 

    await purseToken.transfer(npxsxeMigrationMulSig.address, tokens('500000000'))
    console.log('Purse done')
    await purseToken.transfer(purseDistribution.address, tokens('19237401614'))    
    console.log('Purse done')


  }
};
