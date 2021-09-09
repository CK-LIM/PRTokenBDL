// migrations/3_prepare_upgrade_contract.js
const PurseTokenUpgradable = artifacts.require("PurseTokenUpgradable.sol")
const PurseTokenUpgradableV2 = artifacts.require("PurseTokenUpgradableV2.sol")
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades');
 
module.exports = async function (deployer) {
  const purseTokenUpgradable = await PurseTokenUpgradable.deployed();
  await prepareUpgrade(purseTokenUpgradable.address, PurseTokenUpgradableV2, { deployer });
};