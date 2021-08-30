import Web3 from 'web3'
import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import PurseTokenMultiSigUpgradable from '../abis/PurseTokenMultiSigUpgradable.json'
import NPXSXEMigrationMulSig from '../abis/NPXSXEMigrationMulSig.json'
import PurseDistribution from '../abis/PurseDistribution.json'
// import Main from './Main'
import NPXSMigration from './NPXSMigration'
import PurseDistribute from './PurseDistribution'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { BscConnector } from '@binance-chain/bsc-connector'
import { BncClient } from '@binance-chain/javascript-sdk'
import { rpc } from '@binance-chain/javascript-sdk'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBsc();
    await this.loadBlockchainData();
    await this.loadBcWallet()

    // console.log(window.web3)
    // console.log(window.bsc)
  }

  async loadBlockchainData() {

    const web3 = window.web3;
    console.log()
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)

    // this.setState({ admin: admin })
    // let result = window.ethereum.isConnected()
    // console.log(result)
    // result = window.BinanceChain.isConnected()
    // console.log(result)
    const bsc = window.bsc;
    const bscAccounts = await bsc.getAccount()
    console.log(bscAccounts)


    this.setState({ account: accounts[0] })
    console.log({ account: accounts[0] })
    this.setState({ bscAccount: bscAccounts })
    console.log({ bscAccount: this.state.bscAccount })

    const networkId = await web3.eth.net.getId()
    console.log(networkId)
    this.setState({ networkId: networkId })

    const bscChainId = await window.bsc.getChainId();
    console.log(bscChainId)
    this.setState({ bscChainId: bscChainId })

    // Load PurseToken
    const purseTokenData = PurseTokenMultiSigUpgradable.networks[networkId]
    console.log(purseTokenData)
    if (purseTokenData) {
      const purseToken = new web3.eth.Contract(PurseTokenMultiSigUpgradable.abi, purseTokenData.address)
      this.setState({ purseToken })
      let purseTokenBalance = await purseToken.methods.balanceOf(this.state.account).call()
      this.setState({ purseTokenBalance: purseTokenBalance.toString() })
      console.log({ pursebalance: window.web3.utils.fromWei(purseTokenBalance, 'Ether') })
      const npxsxeMigrationData = NPXSXEMigrationMulSig.networks[networkId]

      let purseTokenBalance_migrate = await purseToken.methods.balanceOf(npxsxeMigrationData.address).call()
      this.setState({ purseTokenBalance_migrate: purseTokenBalance_migrate.toString() })
      console.log({ purseTokenBalance_migrate: window.web3.utils.fromWei(purseTokenBalance_migrate, 'Ether') })

    } else {
      window.alert('PurseToken contract not deployed to detected network.')
    }

    // Load NPXSXEMigration
    const npxsxeMigrationData = NPXSXEMigrationMulSig.networks[networkId]
    console.log(npxsxeMigrationData)
    if (npxsxeMigrationData) {
      const npxsxeMigration = new web3.eth.Contract(NPXSXEMigrationMulSig.abi, npxsxeMigrationData.address)
      this.setState({ npxsxeMigration })

      let txIndex = await npxsxeMigration.methods.transactionIndex().call()
      console.log(txIndex)
      for (var i = 0; i < txIndex; i++) {
        const migrateInfo = await npxsxeMigration.methods.transactions(i).call()
        console.log(migrateInfo)
        this.setState({
          migrate: [...this.state.migrate, migrateInfo]
        })
      }

      console.log(this.state.migrate)

    } else {
      window.alert('NPXSXEMigration contract not deployed to detected network.')
    }


    // Load NPXSXEMDistribution
    const purseDistributionData = PurseDistribution.networks[networkId]
    console.log(purseDistributionData)
    if (purseDistributionData) {
      const purseDistribution = new web3.eth.Contract(PurseDistribution.abi, purseDistributionData.address)
      this.setState({ purseDistribution })
      console.log(this.state.account)
      let distributeIteration = await purseDistribution.methods.releaseIteration(this.state.account).call()
      this.setState({ distributeIteration })
      console.log({ distributeIteration: distributeIteration })

      for (var i = 1; i <= distributeIteration; i++) {
        const holderInfo = await purseDistribution.methods.holder(this.state.account, i).call()
        console.log(holderInfo)
        this.setState({
          holder: [...this.state.holder, holderInfo]
        })
      }

      console.log(this.state.holder)
    } else {
      window.alert('NPXSXEMDistribution contract not deployed to detected network.')
    }
    this.setState({ loading: false })
  }

  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // Request account access if needed
      await window.ethereum.enable();
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    // Non-dapp browsers...
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBsc() {
    // Modern dapp browsers...
    if (window.BinanceChain) {
      window.bsc = new BscConnector({
        // window.bsc = new BscConnector(window.BinanceChain);
        // Request account access if needed
        supportedChainIds: [56, 97, 'Binance-Chain-Ganges'] // later on 1 ethereum mainnet and 3 ethereum ropsten will be supported
      })
      await window.bsc.activate();
      let bscAccount = await window.bsc.getAccount();
      console.log(bscAccount)
      let bscChainId = await window.bsc.getChainId();
      console.log(bscChainId)
    }
    // Legacy dapp browsers...
    // else if (window.web3) {
    //   window.web3 = new Web3(window.web3.currentProvider)
    // }
    // Non-dapp browsers...
    else {
      window.alert('Non-Binance Chain browser detected. You should consider trying Binance Chain Wallet!');
    }
  }

  async loadBcWallet() {
    var account = await window.BinanceChain.requestAccounts().then()
    console.log(account)
    console.log(this.state.bscAccount)
    // let L = account.length
    // let addresses = await window.BinanceChain.request({ method: "eth_requestAccounts" })
    // console.log(addresses)
    // var from = addresses[0]
    // let senderAdd
    // let senderId
    // for (var i = 0; i < L; i++) {
    //   let bbcTestnetAdd = account[i].addresses[0].address
    //   if (bbcTestnetAdd == this.state.bscAccount) {
    //     senderAdd = bbcTestnetAdd
    //     senderId = account[i].id
    //   }
    // }

    const response = await fetch('https://testnet-dex.binance.org/api/v1/account/'+this.state.bscAccount);
    const myJson = await response.json()
    console.log(myJson)
    let bscBalance = myJson.balances
    let L = bscBalance.length
    let bscNpxsxemBalance
    for (var i = 0; i < L; i++) {
      let symbol = bscBalance[i].symbol
      if (symbol == "BNB") {
        bscNpxsxemBalance = bscBalance[i].free
      }
    }
    this.setState({ bscNpxsxemBalance })
    console.log({ bscNpxsxemBalance: bscNpxsxemBalance })

    // // Get Binancewallet info
    // // if (this.state.bscChainId == "Binance-Chain-Tigris") {
    // if (this.state.bscChainId == "Binance-Chain-Ganges") {
    //   const uri = "http://data-seed-pre-2-s1.binance.org:80/"     //testnet
    //   // const uri = "https://dataseed1.defibit.io/"             //mainnet
    //   const network = "testnet"
    //   const bscAccount = async () => {
    //     return new rpc(uri, network).getAccount(senderAdd)
    //     console.log('done')
    //   }
    //   const bscAccountAdd = async () => {
    //     const output = await bscAccount()
    //     this.setState({ output })
    //     console.log(output)
    //     let bscNpxsxemBalance = output.base.coins[0].amount
    //     return bscNpxsxemBalance
    //   }
    //   let bscNpxsxemBalance = await bscAccountAdd()
    //   this.setState({ bscNpxsxemBalance })
    //   console.log({ bscNpxsxemBalance: bscNpxsxemBalance })
    // }
  }




  signMessage = async (address, amount, nonce) => {
    console.log(address);
    console.log(amount);
    console.log(nonce);
    const message = window.web3.utils.soliditySha3(
      { t: 'address', v: this.state.account },
      { t: 'address', v: address },
      { t: 'uint256', v: amount },
      { t: 'uint256', v: nonce },
    ).toString('hex');
    console.log(message);
    let signature = await window.web3.eth.sign(message, this.state.account)
    console.log(signature)
    this.bridgeEthBscTransfer(address, amount, nonce, signature)
  }

  migrateNPXSXEM = (amount) => {
    this.setState({ loading: true })
    this.state.npxsxemToken.methods.approve(this.state.npxsxeMigration._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.npxsxeMigration.methods.migrateNPXSXEM(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  release = (count, iteration) => {
    this.setState({ loading: true })
    this.state.npxsxeMigration.methods.release(count, iteration).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  releaseAll = () => {
    this.setState({ loading: true })
    this.state.npxsxeMigration.methods.releaseAll().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  claim = (iteration) => {
    this.setState({ loading: true })
    this.state.purseDistribution.methods.claim(iteration).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  claimAll = () => {
    this.setState({ loading: true })
    this.state.purseDistribution.methods.claimAll().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }


  bscTransfer = async (transferAmount, toAdd) => {
    var account = await window.BinanceChain.requestAccounts().then()
    let L = account.length

    let senderAdd
    let senderId
    for (var i = 0; i < L; i++) {
      let bbcTestnetAdd = account[i].addresses[0].address
      if (bbcTestnetAdd == this.state.bscAccount) {
        senderAdd = bbcTestnetAdd
        senderId = account[i].id
      }
    }
    // if (!from) return connect()
    await window.BinanceChain.transfer({
      fromAddress: senderAdd,
      toAddress: "tbnb1nk686g47hsm0zyj80acuv43eu65w4qzsvcaeu5",
      asset: "BNB",
      accountId: senderId,
      amount: transferAmount,
      networkId: "bbc-testnet",
      memo: toAdd
    }).then((result) => {
      console.log(result)
      // this.bcSignMessage()
      // this.migrateNPXSXEM(window.web3.utils.toWei(transferAmount, 'Ether'))
      // Paid by PundiX
      // import account
      // this.migrateNPXSXEM(window.web3.utils.toWei(transferAmount, 'Ether'), ({ from: this.state.admin }))
    })
  }

  bcSignMessage = async () => {
    var msg = 'hello world'
    var account = await window.BinanceChain.requestAccounts().then()
    let L = account.length

    let senderAdd
    let senderId
    for (var i = 0; i < L; i++) {
      let bbcTestnetAdd = account[i].addresses[0].address
      if (bbcTestnetAdd == this.state.bscAccount) {
        senderAdd = bbcTestnetAdd
        senderId = account[i].id
      }
    }
    // if (!from) return connect()
    window.BinanceChain.bnbSign(senderAdd, msg).then((sig) => {
      console.log('SIGNED:' + JSON.stringify(sig))
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      purseTokenBalance: '0',
      migrator: [],
      holder: [],
      migrate: [],
      loading: true
    }
  }

  render() {
    let content
    let content2
    let content3
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
      content2 = <p id="loader" className="text-center">Loading...</p>
      content3 = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <NPXSMigration
      account={this.state.account}
      bscAccount={this.state.bscAccount}
      purseTokenBalance={this.state.purseTokenBalance}
      npxsxemTokenBalance={this.state.npxsxemTokenBalance}
      bscNpxsxemBalance={this.state.bscNpxsxemBalance}
      migrator={this.state.migrator}
      migrateNPXSXEM={this.migrateNPXSXEM}
      signMessage={this.signMessage}
      release={this.release}
      releaseAll={this.releaseAll}
      bscTransfer={this.bscTransfer}
      bcSignMessage={this.bcSignMessage}
      />
      content2 = <PurseDistribute
      account={this.state.account}
      purseTokenBalance={this.state.purseTokenBalance}
      holder={this.state.holder}
      claimAll={this.claimAll}
      claim={this.claim}
      handleClick={this.handleClick}
      />
      content3 = <PurseDistribute
    />
    }

    return (
      <Router>
        <div>
          <Navbar bscAccount={this.state.bscAccount} />
          <div className="container-fluid mt-5">
            <div className="row">
              <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '1100px' }}>
                <div className="content mr-auto ml-auto">
                  {/* {content} */}
                  <Switch>
                    {/* <Route path="/" exact > {content} </Route> */}
                    <Route path="/" exact > {content} </Route>
                    <Route path="/PRTokenBDL/" exact > {content} </Route>
                    <Route path="/PRTokenBDL/NPXSXEMigration/" exact > {content} </Route>
                    <Route path="/PRTokenBDL/PurseDistribution/" exact > {content2} </Route>
                  </Switch>
                </div>
              </main>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
