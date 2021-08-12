// web3.personal.unlockAccount(addr, pass);
const toAddress = ["0xb4FC5b9B549744EfEfb7308c6fb9aF8f7f3ad15C"]; // Address of the recipient
const fromAddress = ["0xB76b0cc8e488b5B909F9c0470194BE815eEbE971"]; // testnet
// const fromAddress = ["0x8CF7Fb0326C6a5B5A8dA62e3FE8c5eD8Cb041217"]; // metamasl

// const amount = 0.5; // Willing to send 2 ethers
// const amountToSend = web3.utils.toWei(amount, "ether"); // Convert to wei value

function tokens(n) {
    return web3.utils.toWei(n,'ether');
}

module.exports = async function (callback) {
    let accounts = await web3.eth.getAccounts()
    // console.log(accounts)
    for (let i = 206; i < 301; i++) {
        console.log(accounts[i])
        await web3.eth.sendTransaction({ from:fromAddress,to:accounts[i], value:tokens('2') });
    }
    console.log('done')

    callback()
}