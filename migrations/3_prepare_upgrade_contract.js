// migrations/3_prepare_upgrade_contract.js
const PurseTokenMultiSigUpgradable = artifacts.require("PurseTokenMultiSigUpgradable.sol")
const PurseTokenMultiSigUpgradableV2 = artifacts.require("PurseTokenMultiSigUpgradableV2.sol")
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades');
 
module.exports = async function (deployer) {
  const purseTokenMultiSigUpgradable = await PurseTokenMultiSigUpgradable.deployed();
  await prepareUpgrade(purseTokenMultiSigUpgradable.address, PurseTokenMultiSigUpgradableV2, { deployer });
};