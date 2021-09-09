import Web3 from 'web3'
import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import PurseTokenUpgradable from '../abis/PurseTokenUpgradable.json'
import BEP20FixedSupply from '../abis/NPXSXEMBSC.json'
import NPXSXEMigration from '../abis/NPXSXEMigration.json'
import PurseDistribution from '../abis/PurseDistribution.json'
// import Main from './Main'
import NPXSMigration from './NPXSMigration'
import PurseDistribute from './PurseDistribution'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import { BscConnector } from '@binance-chain/bsc-connector'
// import { BncClient } from '@binance-chain/javascript-sdk'
// import { rpc } from '@binance-chain/javascript-sdk'

class App extends Component {

  async componentWillMount() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await this.loadWeb3();
    await this.loadBlockchainData();
    // await this.loadBsc();
    while(this.state.loading == false ){
      await this.loadBlockchainData()
      console.log("repeat")
      await delay(3000);
   }
    
    // await this.loadBcWallet()
    // console.log(window.web3)
    // console.log(window.bsc)
  }

  async loadBlockchainData() {

    const web3 = window.web3;
    // console.log()
    const accounts = await web3.eth.getAccounts()
    // console.log(accounts)

    // let result = window.ethereum.isConnected()
    // console.log(result)

    this.setState({ account: accounts[0] })
    const first4Account = this.state.account.substring(0,4)
    const last4Account = this.state.account.slice(-4)
    this.setState({ first4Account: first4Account })
    this.setState({ last4Account: last4Account })

    const networkId = await web3.eth.net.getId()
    // console.log(networkId)
    this.setState({ networkId: networkId })

    // Load PurseToken
    const purseTokenData = PurseTokenUpgradable.networks[networkId]
    // console.log(purseTokenData)
    if (purseTokenData) {
      const purseToken = new web3.eth.Contract(PurseTokenUpgradable.abi, purseTokenData.address)
      this.setState({ purseToken })
      let purseTokenBalance = await purseToken.methods.balanceOf(this.state.account).call()
      this.setState({ purseTokenBalance: purseTokenBalance.toString() })
      // console.log({ pursebalance: window.web3.utils.fromWei(purseTokenBalance, 'Ether') })
      const npxsxeMigrationData = NPXSXEMigration.networks[networkId]

      let purseTokenBalance_migrate = await purseToken.methods.balanceOf(npxsxeMigrationData.address).call()
      this.setState({ purseTokenBalance_migrate: purseTokenBalance_migrate.toString() })
      // console.log({ purseTokenBalance_migrate: window.web3.utils.fromWei(purseTokenBalance_migrate, 'Ether') })

    } else {
      window.alert('PurseToken contract not deployed to detected network.')
    }

    
    // Load NPXSXEMToken
    // const purseTokenData = PurseTokenMultiSigUpgradable.networks[networkId]
    // console.log(purseTokenData)
    if (purseTokenData) {
      const npxsxemToken = new web3.eth.Contract(BEP20FixedSupply.abi, "0x344053c5dBbBC7F24Fbb7d65cEB6c2D811F0E962")
      this.setState({ npxsxemToken })
      let npxsxemTokenBalance = await npxsxemToken.methods.balanceOf(this.state.account).call()
      this.setState({ npxsxemTokenBalance: npxsxemTokenBalance.toString() })
      // console.log({ npxsxembalance: window.web3.utils.fromWei(npxsxemTokenBalance, 'Ether') })
      const npxsxeMigrationData = NPXSXEMigration.networks[networkId]

      let npxsxemTokenBalance_migrate = await npxsxemToken.methods.balanceOf(npxsxeMigrationData.address).call()
      this.setState({ npxsxemTokenBalance_migrate: npxsxemTokenBalance_migrate.toString() })
      // console.log({ npxsxemTokenBalance_migrate: window.web3.utils.fromWei(npxsxemTokenBalance_migrate, 'Ether') })
    } 
    else {
      window.alert('NPXSXEMToken contract not deployed to detected network.')
    }


    // Load NPXSXEMigration
    const npxsxeMigrateData = NPXSXEMigration.networks[networkId]
    // console.log(npxsxeMigrateData)
    if (npxsxeMigrateData) {
      const npxsxeMigrate = new web3.eth.Contract(NPXSXEMigration.abi, npxsxeMigrateData.address)
      
      this.setState({ npxsxeMigrate })
      // console.log(this.state.npxsxeMigrate.address)

      // let migrateIndex = await npxsxeMigrate.methods.migrateIndex().call()
      // console.log(migrateIndex)
      // for (var i = 0; i < migrateIndex; i++) {
      //   const migratorInfo = await npxsxeMigrate.methods.migration(i).call()
      //   console.log(migratorInfo)
      //   this.setState({
      //     migrate: [...this.state.migrate, migrateInfo]
      //   })
      // }

      // console.log(this.state.migrate)

    } else {
      window.alert('NPXSXEMigration contract not deployed to detected network.')
    }


    // Load NPXSXEMDistribution
    const purseDistributionData = PurseDistribution.networks[networkId]
    // console.log(purseDistributionData)
    if (purseDistributionData) {
      const purseDistribution = new web3.eth.Contract(PurseDistribution.abi, purseDistributionData.address)
      this.setState({ purseDistribution })
      // console.log(this.state.account)

      // const holderInfo = await purseDistribution.methods.holder(this.state.account).call()
      // console.log(holderInfo)
      // this.setState({ holderInfo })
      this.setState({holder: []})
      for (var i = 0; i < 12; i++) {
        const holderInfo = await purseDistribution.methods.holder(this.state.account,i).call()
        if (holderInfo.distributeAmount > 0) {
            this.setState({
              holder: [...this.state.holder, [holderInfo, i]]
            })
        }        
      }
      // console.log(this.state.holder)


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

  migrateNPXSXEM = (toAddress, amount) => {
    this.setState({ loading: true })
    this.state.npxsxemToken.methods.approve(this.state.npxsxeMigrate._address, amount).send({ from: this.state.account }).then((result) => {
      this.state.npxsxeMigrate.methods.migrateNPXSXEM(toAddress, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        this.componentWillMount();
      })
    })
  }

  claim = (iteration) => {
    this.setState({ loading: true })
    this.state.purseDistribution.methods.claim(iteration).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      this.componentWillMount();
    })
  }

  claimAll = (iterationEnd) => {
    this.setState({ loading: true })
    this.state.purseDistribution.methods.claimAll(iterationEnd).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      this.componentWillMount();
    })
  }


  bscTransfer = async (transferAmount, toAdd) => {
    var account = await window.BinanceChain.requestAccounts()
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
    // var originalThen = Promise.prototype.then;
    // var originalCatch = Promise.prototype.catch;
    try {
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
        alert("Transaction successful!\n" + "From     : " + result.fromAddress + "\n" + "To          : " + result.toAddress + "\n" + "Amount : " + result.amount + "\n\n" + "For transaction details, please check your Binance wallet activity.")
      })
    } catch (error) {
      alert(error.message)
    }

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
      holderInfo: {},
      migrator: [],
      migrate: [],
      holder: [],
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
        purseTokenBalance={this.state.purseTokenBalance}
        npxsxemTokenBalance={this.state.npxsxemTokenBalance}
        bscNpxsxemBalance={this.state.bscNpxsxemBalance}
        migrator={this.state.migrator}
        first4Account={this.state.first4Account}
        last4Account={this.state.last4Account}
        migrateNPXSXEM={this.migrateNPXSXEM}
        signMessage={this.signMessage}
        release={this.release}
        releaseAll={this.releaseAll}
        bscTransfer={this.bscTransfer}
        bcSignMessage={this.bcSignMessage}
      />
      content2 = <PurseDistribute
        account={this.state.account}
        first4Account={this.state.first4Account}
        last4Account={this.state.last4Account}
        purseTokenBalance={this.state.purseTokenBalance}
        holderInfo={this.state.holderInfo}
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
          <Navbar account={this.state.account} />
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
