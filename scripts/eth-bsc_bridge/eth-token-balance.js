const XToken = artifacts.require('./XToken.sol');

module.exports = async done => {
  const [sender, _] = await web3.eth.getAccounts();
  const xToken = await XToken.deployed();
  const balance = await xToken.balanceOf(sender);
  console.log(balance.toString());
  done();
}