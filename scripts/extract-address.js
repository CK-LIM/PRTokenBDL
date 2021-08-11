const Web3 = require('web3');
// const BridgeEth = require('../src/abis/BridgeEth.json');
// const BridgeBsc = require('../src/abis/BridgeBsc.json');
const infuraKey = "";

// const web3Eth = new Web3(new Web3.providers.WebsocketProvider(`wss://rinkeby.infura.io/ws/v3/${infuraKey}`));
const web3Eth = new Web3(`https://rinkeby.infura.io/v3/${infuraKey}`);            // http provider not supported 
const web3Eth = new Web3(new Web3.providers.WebsocketProvider(``));
// const web3Bsc = new Web3(`https://data-seed-prebsc-1-s1.binance.org:8545/`);


const adminPrivKey = '';
const { address: admin } = web3Eth.eth.accounts.wallet.add(adminPrivKey);

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks['4'].address
);

const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  BridgeBsc.networks['97'].address
);

// bridgeEth.getPastEvents("Transfer",{fromBlock: 0, toBlock: 'latest'})
// .then(events => console.log(events))
// .catch((err) => console.error(err));
//  .then(async event => {
//   console.log(event);

// bridgeEth.events.Transfer({fromBlock: 0, step: 0})
// .on('data', async event => {
// //  console.log(event);
//   const { from, to, amount, date, nonce, signature } = event.returnValues;

//   const tx = bridgeBsc.methods.mint(from, to, amount, nonce, signature);
//   const [gasPrice, gasCost] = await Promise.all([
//     web3Bsc.eth.getGasPrice(),
//     tx.estimateGas({from: admin}),
//   ]);
//   const data = tx.encodeABI();
//   const txData = {
//     from: admin,
//     to: bridgeBsc.options.address,
//     data,
//     gas: gasCost,
//     gasPrice
//   };
//   const receipt = await web3Bsc.eth.sendTransaction(txData);
//   console.log(`Transaction hash: ${receipt.transactionHash}`);
//   console.log(`
//     Processed transfer:
//     - from ${from} 
//     - to ${to} 
//     - amount ${amount} tokens
//     - date ${date}
//     - nonce ${nonce}
//   `);
// })
//  .on('error', console.error);
// .catch((err) => console.error(err));      //for past events



bridgeBsc.events.Transfer({fromBlock: 0, step: 0})
.on('data', async event => {
//  console.log(event);
  const { from, to, amount, date, nonce, signature } = event.returnValues;

  const tx = bridgeEth.methods.mint(from, to, amount, nonce, signature);
  const [gasPrice, gasCost] = await Promise.all([
    web3Eth.eth.getGasPrice(),
    tx.estimateGas({from: admin}),
  ]);
  const data = tx.encodeABI();
  const txData = {
    from: admin,
    to: bridgeEth.options.address,
    data,
    gas: gasCost,
    gasPrice
  };
  const receipt = await web3Eth.eth.sendTransaction(txData);
  console.log(`Transaction hash: ${receipt.transactionHash}`);
  console.log(`
    Processed transfer:
    - from ${from} 
    - to ${to} 
    - amount ${amount} tokens
    - date ${date}
    - nonce ${nonce}
  `);
})
 .on('error', console.error);