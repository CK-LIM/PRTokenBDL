// const addressFrom = "tbnb1nk686g47hsm0zyj80acuv43eu65w4qzsvcaeu5"// sender address
// const addressTo = "tbnb1xkyvtsflufxmk6ferpczf07rlxhzdj3cl5ef2z" // addressTo string

const { BncClient } = require("@binance-chain/javascript-sdk")
const { rpc } = require("@binance-chain/javascript-sdk")
const axios = require("axios")

const asset = "BNB" // asset string
const amount = 0.01 // amount float
const addressTo = "tbnb1xkyvtsflufxmk6ferpczf07rlxhzdj3cl5ef2z" // addressTo string
const message = "A note to you" // memo string
const api = "https://testnet-dex.binance.org/" /// api string

let privKey = "" // privkey hexstring (keep this safe)

const bnbClient = new BncClient(api)
const httpClient = axios.create({ baseURL: api })

bnbClient.chooseNetwork("testnet") // or this can be "mainnet"
bnbClient.setPrivateKey(privKey)
bnbClient.initChain()

const addressFrom = bnbClient.getClientKeyAddress() // sender address string (e.g. bnb1...)
const sequenceURL = `${api}api/v1/account/${addressFrom}/sequence`

const uri = "data-seed-pre-0-s1.binance.org:80"
new rpc(uri, "testnet").getAccount("tbnb1nk686g47hsm0zyj80acuv43eu65w4qzsvcaeu5")
.then((x) => console.log("", JSON.stringify(x)))

httpClient
  .get(sequenceURL)
  .then((res) => {
    const sequence = res.data.sequence || 0
    // return bnbClient.transfer(
    //   addressFrom,
    //   addressTo,
    //   amount,
    //   asset,
    //   message,
    //   sequence
    // )
    return bnbClient.getBalance(
      addressFrom
    )
  })
  .then((result) => {
    console.log(result)
    if (result.status === 200) {
      console.log("success", result.result[0].hash)
    } else {
      console.error("error", result)
    }
  })
  .catch((error) => {
    console.error("error", error)
  })