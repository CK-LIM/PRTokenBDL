module.exports = async function (callback) {

    for (let i = 1; i < 10001; i++) {
        await web3.eth.personal.newAccount()
        // const { privateKey: account } = web3.eth.accounts.create()
        // console.log(account)
        // console.log(i+'done')

    }
    account = await web3.eth.getAccounts()
    console.log(account)

    callback()
}