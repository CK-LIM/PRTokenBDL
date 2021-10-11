import Web3 from 'web3'
import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import PurseTokenUpgradable from '../abis/PurseTokenUpgradable.json'
import NPXSXEMigration from '../abis/NPXSXEMigration.json'
import NPXSXEMBSC from '../abis/NPXSXEMBSC.json'
import PurseDistribution from '../abis/PurseDistribution.json'
import NPXSMigration from './NPXSMigration'
import PurseDistribute from './PurseDistribution'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    while (this.state.loading == false) {
      if (this.state.wallet == true) {
        await this.loadBlockchainDataRepeat()
        // console.log("repeattrue")
        await this.delay(1500);
      } else {
        window.alert('Please connect metamask wallet to Binance Smart Chain Testnet and refresh webpage.')
        await this.loadBlockchainDataRepeat()
        // console.log("repeat")
        await this.delay(1500);
      }
    }
  }

  async loadBlockchainData() {

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()

    this.setState({ account: accounts[0] })
    const first4Account = this.state.account.substring(0, 4)
    const last4Account = this.state.account.slice(-4)
    this.setState({ first4Account: first4Account })
    this.setState({ last4Account: last4Account })
    const networkId = await web3.eth.net.getId()
    this.setState({ networkId: networkId })

    // Load PurseToken
    const purseTokenData = PurseTokenUpgradable.networks[networkId]
    if (purseTokenData) {
      const purseToken = new web3.eth.Contract(PurseTokenUpgradable.abi, purseTokenData.address)
      this.setState({ purseToken })
      let purseTokenBalance = await purseToken.methods.balanceOf(this.state.account).call()
      this.setState({ purseTokenBalance: purseTokenBalance.toString() })
    }

    // Load NPXSXEMToken
    const nPXSXEMBSCTokenData = NPXSXEMBSC.networks[networkId]
    if (nPXSXEMBSCTokenData) {
      const npxsxemToken = new web3.eth.Contract(NPXSXEMBSC.abi, nPXSXEMBSCTokenData.address)
      this.setState({ npxsxemToken })
      let npxsxemTokenBalance = await npxsxemToken.methods.balanceOf(this.state.account).call()
      this.setState({ npxsxemTokenBalance: npxsxemTokenBalance.toString() })
    }

    // Load NPXSXEMigration
    const npxsxeMigrateData = NPXSXEMigration.networks[networkId]
    if (npxsxeMigrateData) {
      const npxsxeMigrate = new web3.eth.Contract(NPXSXEMigration.abi, npxsxeMigrateData.address)
      this.setState({ npxsxeMigrate })
      let startMigrate = await npxsxeMigrate.methods.isMigrationStart().call()
      this.setState({ startMigrate })
      let endMigrate = await npxsxeMigrate.methods.endMigration().call()
      if (endMigrate == 0) {
        var date = ''
        this.setState({ date })
      } else {
        var date = new Date(endMigrate * 1000)
        this.setState({ date })
      }


      let migrateIndex = await npxsxeMigrate.methods.migrateIndex().call()
      this.setState({ migrateIndex })
      this.setState({ migrator: [] })

      for (var i = 0; i < migrateIndex; i++) {
        const migratorInfo = await npxsxeMigrate.methods.migration(i).call()
        if (migratorInfo.migrator == this.state.account) {
          this.setState({
            migrator: [...this.state.migrator, migratorInfo]
          })
        }
      }
    }

    // Load PurseDistribution
    const purseDistributionData = PurseDistribution.networks[networkId]
    if (purseDistributionData) {
      const purseDistribution = new web3.eth.Contract(PurseDistribution.abi, purseDistributionData.address)
      this.setState({ purseDistribution })

      let claimStart = await purseDistribution.methods.isClaimStart().call()
      this.setState({ claimStart })
      let endDistribute = await purseDistribution.methods.endDistribution().call()
      if (endDistribute == 0) {
        var endDistributeDate = ''
        this.setState({ endDistributeDate })
      } else {
        var endDistributeDate = new Date(endDistribute * 1000)
        this.setState({ endDistributeDate })
      }


      let isClaim = await purseDistribution.methods.holder(this.state.account, 0).call()
      this.setState({ isClaim: isClaim.isRedeem })
      this.setState({ holder: [] })
      this.state.holder = [];
      for (var i = 0; i < 1; i++) {
        const holderInfo = await purseDistribution.methods.holder(this.state.account, i).call()
        if (holderInfo.distributeAmount > 0) {
          this.setState({
            holder: [...this.state.holder, [holderInfo, i]]
          })
        }
      }
      this.setState({ loading: false })
      this.setState({ wallet: true })
    }
    else {
      while (this.state.loading == true) {
        this.setState({ wallet: false })
        window.alert('Please connect metamask wallet to Binance Smart Chain Testnet and refresh webpage.')        
        await this.delay(1500);
        await this.loadBlockchainData()
      }
    }
  }



  async loadBlockchainDataRepeat() {

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    if (this.state.account != accounts[0]) {
      await this.loadBlockchainData();
    }
    this.setState({ account: accounts[0] })
    const first4Account = this.state.account.substring(0, 4)
    const last4Account = this.state.account.slice(-4)
    this.setState({ first4Account: first4Account })
    this.setState({ last4Account: last4Account })
    const networkId = await web3.eth.net.getId()
    this.setState({ networkId: networkId })

    // Load PurseToken
    const purseTokenData = PurseTokenUpgradable.networks[networkId]
    if (purseTokenData) {
      const purseToken = new web3.eth.Contract(PurseTokenUpgradable.abi, purseTokenData.address)
      this.setState({ purseToken })
      let purseTokenBalance = await purseToken.methods.balanceOf(this.state.account).call()
      this.setState({ purseTokenBalance: purseTokenBalance.toString() })
    }


    // Load NPXSXEMToken
    const nPXSXEMBSCTokenData = NPXSXEMBSC.networks[networkId]
    if (nPXSXEMBSCTokenData) {
      const npxsxemToken = new web3.eth.Contract(NPXSXEMBSC.abi, nPXSXEMBSCTokenData.address)
      this.setState({ npxsxemToken })
      let npxsxemTokenBalance = await npxsxemToken.methods.balanceOf(this.state.account).call()
      this.setState({ npxsxemTokenBalance: npxsxemTokenBalance.toString() })
    }


    // Load NPXSXEMigration
    const npxsxeMigrateData = NPXSXEMigration.networks[networkId]
    if (npxsxeMigrateData) {
      const npxsxeMigrate = new web3.eth.Contract(NPXSXEMigration.abi, npxsxeMigrateData.address)
      this.setState({ npxsxeMigrate })
      let startMigrate = await npxsxeMigrate.methods.isMigrationStart().call()
      this.setState({ startMigrate })
      let endMigrate = await npxsxeMigrate.methods.endMigration().call()
      if (endMigrate == 0) {
        var date = ''
        this.setState({ date })
      } else {
        var date = new Date(endMigrate * 1000)
        this.setState({ date })
      }

      let migrateIndexNew = await npxsxeMigrate.methods.migrateIndex().call()
      if (this.state.migrateIndex != migrateIndexNew) {
        this.setState({ migrator: [] })
        for (var i = 0; i < migrateIndexNew; i++) {
          const migratorInfo = await npxsxeMigrate.methods.migration(i).call()
          if (migratorInfo.migrator == this.state.account) {
            this.setState({
              migrator: [...this.state.migrator, migratorInfo]
            })
          }
        }
        this.state.migrateIndex = migrateIndexNew
      }
    }


    // Load PurseDistribution
    const purseDistributionData = PurseDistribution.networks[networkId]
    if (purseDistributionData) {
      const purseDistribution = new web3.eth.Contract(PurseDistribution.abi, purseDistributionData.address)
      this.setState({ purseDistribution })

      let endDistribute = await purseDistribution.methods.endDistribution().call()
      if (endDistribute == 0) {
        var endDistributeDate = ''
        this.setState({ endDistributeDate })
      } else {
        var endDistributeDate = new Date(endDistribute * 1000)
        this.setState({ endDistributeDate })
      }

      let isClaimNew = await purseDistribution.methods.holder(this.state.account, 0).call()
      this.setState({ isClaimNew: isClaimNew.isRedeem })

      if (this.state.isClaim != this.state.isClaimNew) {
        this.setState({ holder: [] })
        for (var i = 0; i < 1; i++) {
          const holderInfo = await purseDistribution.methods.holder(this.state.account, i).call()
          if (holderInfo.distributeAmount > 0) {
            this.setState({
              holder: [...this.state.holder, [holderInfo, i]]
            })
          }
        }
        this.state.isClaim = this.state.isClaimNew
      }

      this.setState({ loading: false })
      this.setState({ wallet: true })
    }
    else {
      this.setState({ wallet: false })
    }
  }

  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // Request account access if needed
      await window.ethereum.enable();
      const networkId = await window.web3.eth.net.getId()
      console.log(networkId)
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


  delay = ms => new Promise(res => setTimeout(res, ms));

  migrateNPXSXEM = async (toAddress, amount) => {
    var today = new Date();
    if (this.state.startMigrate == false || this.state.endDistributeDate < today) {
      alert("Migration is not available")
    } else if (this.state.npxsxemTokenBalance < parseInt(amount)) {
      alert("Insuffient funds")
    } else {
      try {
        this.setState({ loading: true })
        await this.state.npxsxemToken.methods.approve(this.state.npxsxeMigrate._address, amount).send({ from: this.state.account }).then(async (result) => {
          try {
            await this.state.npxsxeMigrate.methods.migrateNPXSXEM(toAddress, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
              this.delay(2000).then((result) => {
                alert("Transaction send!\n" + "Hash: " + hash + "\n\n" + "For transaction details, please check your wallet activity." + "\n\n" + "Webpage will update migration record after transaction completed.")
                this.setState({ loading: false })
                this.componentWillMount()
              })
            })
          } catch (error) {
            alert(error.message)
            this.componentWillMount()
          }
        })
      } catch (error) {
        alert(error.message)
        this.componentWillMount()
      }
    }
  }

  claim = async (iteration) => {
  var today = new Date(); 
    if (this.state.claimStart == false || this.state.endDistributeDate < today) {
      alert("Distribution is not available")
    } else {
      try {
        this.setState({ loading: true })
        await this.state.purseDistribution.methods.claim(iteration).send({ from: this.state.account }).on('transactionHash', (hash) => {
          alert("Transaction send!\n" + "Hash: " + hash + "\n\n" + "For transaction details, please check your wallet activity." + "\n\n" + "Webpage will update migration record after transaction completed.")
          this.setState({ loading: false })
          this.componentWillMount()
        })
      } catch (error) {
        alert(error.message)
        this.componentWillMount()
      }
    }
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
        alert("Transaction successful!\n" + "From     : " + result.fromAddress + "\n" + "To          : " + result.toAddress + "\n" + "Amount : " + result.amount + "\n\n" + "For transaction details, please check your Binance wallet activity.")
      })
    } catch (error) {
      alert(error.message)
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      purseTokenBalance: '0',
      startMigrate: '0',
      endDistributeDate: '0',
      date: '0',
      holderInfo: {},
      migrator: [],
      holder: [],
      loading: true,
      wallet: true
    }
  }

  render() {
    let content
    let content2
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
      content2 = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <NPXSMigration
        account={this.state.account}
        purseTokenBalance={this.state.purseTokenBalance}
        npxsxemTokenBalance={this.state.npxsxemTokenBalance}
        migrator={this.state.migrator}
        first4Account={this.state.first4Account}
        last4Account={this.state.last4Account}
        date={this.state.date}
        migrateNPXSXEM={this.migrateNPXSXEM}
        release={this.release}
        releaseAll={this.releaseAll}
      />
      content2 = <PurseDistribute
        account={this.state.account}
        first4Account={this.state.first4Account}
        last4Account={this.state.last4Account}
        purseTokenBalance={this.state.purseTokenBalance}
        holderInfo={this.state.holderInfo}
        endDistributeDate={this.state.endDistributeDate}
        holder={this.state.holder}
        claimAll={this.claimAll}
        claim={this.claim}
        handleClick={this.handleClick}
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
