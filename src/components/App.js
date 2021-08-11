import Web3 from 'web3'
import React, { Component } from 'react'
import Navbar from './Navbar'
import LPXToken from '../abis/LPXToken.json'
import XToken from '../abis/XToken.json'
import PurseToken from '../abis/PurseToken.json'
import NPXSXEMToken from '../abis/NPXSXEMToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import BridgeEth from '../abis/BridgeEth.json'
import BridgeBsc from '../abis/BridgeBsc.json'
import NPXSXEMigration from '../abis/NPXSXEMigration.json'
import PurseDistribution from '../abis/PurseDistribution.json'
import Main from './Main'
import NPXSMigration from './NPXSMigration'
import PurseDistribute from './PurseDistribution'
import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { BscConnector } from '@binance-chain/bsc-connector'
import { BncClient } from '@binance-chain/javascript-sdk'
import { rpc } from '@binance-chain/javascript-sdk'
import { useHistory } from "react-router-dom";
import cors from'cors'
// import { axios } from 'axios'

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
    let bscNpxsxemBalance = this.state.output
    console.log({ bscNpxsxemBalance })

    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
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

    // Load XToken
    const xTokenData = XToken.networks[networkId]
    console.log(xTokenData)
    if (xTokenData) {
      const xToken = new web3.eth.Contract(XToken.abi, xTokenData.address)
      this.setState({ xToken })
      let xTokenBalance = await xToken.methods.balanceOf(this.state.account).call()
      this.setState({ xTokenBalance: xTokenBalance.toString() })
      console.log({ xbalance: window.web3.utils.fromWei(xTokenBalance, 'Ether') })
    } else {
      window.alert('XToken contract not deployed to detected network.')
    }

    // Load LpXToken
    const lpXTokenData = LPXToken.networks[networkId]
    console.log(lpXTokenData)
    if (lpXTokenData) {
      const lpXToken = new web3.eth.Contract(LPXToken.abi, lpXTokenData.address)
      this.setState({ lpXToken })
      console.log(this.state.lpXToken)
      let lpXTokenBalance = await lpXToken.methods.balanceOf(this.state.account).call()
      const tokenFarmData = TokenFarm.networks[networkId]
      let lpXTokenBalance_farm = await lpXToken.methods.balanceOf(tokenFarmData.address).call()
      this.setState({ lpXTokenBalance: lpXTokenBalance.toString() })
      this.setState({ lpXTokenBalance_farm: lpXTokenBalance_farm.toString() })
      console.log({ lpXbalance: window.web3.utils.fromWei(lpXTokenBalance, 'Ether') })
      console.log({ lpXbalance_farm: window.web3.utils.fromWei(lpXTokenBalance_farm, 'Ether') })
    } else {
      window.alert('LpXToken contract not deployed to detected network.')
    }

    // Load PurseToken
    const purseTokenData = PurseToken.networks[networkId]
    console.log(purseTokenData)
    if (purseTokenData) {
      const purseToken = new web3.eth.Contract(PurseToken.abi, purseTokenData.address)
      this.setState({ purseToken })
      let purseTokenBalance = await purseToken.methods.balanceOf(this.state.account).call()
      this.setState({ purseTokenBalance: purseTokenBalance.toString() })
      console.log({ pursebalance: window.web3.utils.fromWei(purseTokenBalance, 'Ether') })
      const tokenFarmData = TokenFarm.networks[networkId]
      const npxsxeMigrationData = NPXSXEMigration.networks[networkId]

      let purseTokenBalance_farm = await purseToken.methods.balanceOf(tokenFarmData.address).call()
      this.setState({ purseTokenBalance_farm: purseTokenBalance_farm.toString() })
      console.log({ purseTokenBalance_farm: window.web3.utils.fromWei(purseTokenBalance_farm, 'Ether') })

      let purseTokenBalance_migrate = await purseToken.methods.balanceOf(npxsxeMigrationData.address).call()
      this.setState({ purseTokenBalance_migrate: purseTokenBalance_migrate.toString() })
      console.log({ purseTokenBalance_migrate: window.web3.utils.fromWei(purseTokenBalance_migrate, 'Ether') })

    } else {
      window.alert('PurseToken contract not deployed to detected network.')
    }

    // Load NPXSXEMToken
    const npxsxemTokenData = NPXSXEMToken.networks[networkId]
    console.log(npxsxemTokenData)
    if (npxsxemTokenData) {
      const npxsxemToken = new web3.eth.Contract(NPXSXEMToken.abi, npxsxemTokenData.address)
      this.setState({ npxsxemToken })
      let npxsxemTokenBalance = await npxsxemToken.methods.balanceOf(this.state.account).call()
      this.setState({ npxsxemTokenBalance: npxsxemTokenBalance.toString() })
      console.log({ npxsxembalance: window.web3.utils.fromWei(npxsxemTokenBalance, 'Ether') })
    } else {
      window.alert('NPXSXEMToken contract not deployed to detected network.')
    }

    // Load NPXSXEMigration
    const npxsxeMigrationData = NPXSXEMigration.networks[networkId]
    console.log(npxsxeMigrationData)
    if (npxsxeMigrationData) {
      const npxsxeMigration = new web3.eth.Contract(NPXSXEMigration.abi, npxsxeMigrationData.address)
      this.setState({ npxsxeMigration })
      let migrateCount = await npxsxeMigration.methods.migrateCount(this.state.account).call()
      this.setState({ migrateCount })
      console.log({ migrateCount: migrateCount })
      let releaseIteration = await npxsxeMigration.methods.releaseIteration(this.state.account, migrateCount).call()
      this.setState({ releaseIteration })
      console.log({ releaseIteration: releaseIteration })

      for (var i = 1; i <= migrateCount; i++) {
        for (var n = 1; n <= releaseIteration; n++) {
          const migratorInfo = await npxsxeMigration.methods.migrator(this.state.account, i, n).call()
          // this.setState({ migratorInfo })
          // console.log({ migratorInfo: migratorInfo })
          this.setState({
            migrator: [...this.state.migrator, migratorInfo]
          })
        }
      }
      console.log(this.state.migrator)
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


    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    console.log(tokenFarmData)
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })

      let stakerInfo = await tokenFarm.methods.stakerInfo(this.state.account).call()
      this.setState({ stakerInfo })
      console.log({ stakerInfo: stakerInfo })

      let farmInfo = await tokenFarm.methods.farmInfo().call()
      this.setState({ farmInfo })
      console.log({ farmInfo: farmInfo })

    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }
    this.setState({ loading: false })

    if (networkId == 4) {
      // Load BridgeEth
      const bridgeEthData = BridgeEth.networks[networkId]
      console.log(bridgeEthData)
      if (bridgeEthData) {
        const bridgeEth = new web3.eth.Contract(BridgeEth.abi, bridgeEthData.address)
        this.setState({ bridgeEth })
      } else {
        window.alert('BridgeEth contract not deployed to detected network.')
      }
      console.log('4ethbsc')
      this.setState({ loading: false })
    } else if (networkId == 97) {
      console.log('97ethbsc')
      // Load BridgeEth
      const bridgeBscData = BridgeEth.networks[networkId]
      console.log(bridgeBscData)
      if (bridgeBscData) {
        const bridgeBsc = new web3.eth.Contract(BridgeBsc.abi, bridgeBscData.address)
        this.setState({ bridgeBsc })
      } else {
        window.alert('BridgeBsc contract not deployed to detected network.')
      }
      this.setState({ loading: false })
    }
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
    let L = account.length
    // let addresses = await window.BinanceChain.request({ method: "eth_requestAccounts" })
    // console.log(addresses)
    // var from = addresses[0]
    let senderAdd
    let senderId
    for (var i = 0; i < L; i++) {
      let bbcTestnetAdd = account[i].addresses[0].address
      if (bbcTestnetAdd == this.state.bscAccount) {
        senderAdd = bbcTestnetAdd
        senderId = account[i].id
      }
    }

    // if (this.state.bscChainId == "Binance-Chain-Tigris") {
    if (this.state.bscChainId == "Binance-Chain-Ganges") {
      const uri = "http://data-seed-pre-2-s1.binance.org:80/"     //testnet
      // const uri = "https://dataseed1.defibit.io/"             //mainnet
      const network = "testnet"
      const bscAccount = async () => {
        return new rpc(uri, network).getAccount(senderAdd)
        console.log('done')
      }
      const bscAccountAdd = async () => {
        const output = await bscAccount()
        this.setState({ output })
        console.log(output)
        let bscNpxsxemBalance = output.base.coins[0].amount
        return bscNpxsxemBalance
      }
      let bscNpxsxemBalance = await bscAccountAdd()
      this.setState({ bscNpxsxemBalance })
      console.log({ bscNpxsxemBalance: bscNpxsxemBalance })
    }
  }


  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.xToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.lpXToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  emergencyUnstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.lpXToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.emergencyUnstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  transferOwnership = (address, amount) => {
    this.setState({ loading: true })
    this.state.lpXToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.transferOwnership(address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  updateRewardTokens = () => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.updateRewardTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  redeemToken = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.redeemToken(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  bridgeEthBscTransfer = (address, amount, nonce, signature) => {
    this.setState({ loading: true })
    if (this.state.networkId == 4) {
      this.state.bridgeEth.methods.burn(address, amount, nonce, signature).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    } else if (this.state.networkId == 97) {
      this.state.bridgeBsc.methods.burn(address, amount, nonce, signature).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
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


  bscTransfer = async (transferAmount) => {
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
      toAddress: "tbnb1xkyvtsflufxmk6ferpczf07rlxhzdj3cl5ef2z",
      asset: "BNB",
      accountId: senderId,
      amount: transferAmount,
      networkId: "bbc-testnet"
    }).then((result) => {
      console.log(result)
      this.migrateNPXSXEM(window.web3.utils.toWei(transferAmount, 'Ether'))
    })
  }

  bscSignMessage = async () => {
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

  handleClick(path) {
    const history = useHistory();
    history.push(path);
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      xToken: {},
      lpXToken: {},
      purseToken: {},
      tokenFarm: {},
      bridgeEth: {},
      xTokenBalance: '0',
      lpXTokenBalance: '0',
      lpXTokenBalance_farm: '0',
      purseTokenBalance: '0',
      purseTokenBalance_farm: '0',
      npxsxemTokenBalance: '0',
      bscNpxsxemBalance: '0',
      stakerInfo: '0',
      farmInfo: '0',
      migrator: [],
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
      content = <Main
        account={this.state.account}
        xTokenBalance={this.state.xTokenBalance}
        lpXTokenBalance={this.state.lpXTokenBalance}
        lpXTokenBalance_farm={this.state.lpXTokenBalance_farm}
        purseTokenBalance={this.state.purseTokenBalance}
        purseTokenBalance_farm={this.state.purseTokenBalance_farm}
        npxsxemTokenBalance={this.state.npxsxemTokenBalance}
        stakerInfo={this.state.stakerInfo}
        farmInfo={this.state.farmInfo}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        emergencyUnstakeTokens={this.emergencyUnstakeTokens}
        transferOwnership={this.transferOwnership}
        updateRewardTokens={this.updateRewardTokens}
        redeemToken={this.redeemToken}
        bridgeEthBscTransfer={this.bridgeEthBscTransfer}
        signMessage={this.signMessage}
      />
      content2 = <NPXSMigration
        account={this.state.account}
        purseTokenBalance={this.state.purseTokenBalance}
        npxsxemTokenBalance={this.state.npxsxemTokenBalance}
        bscNpxsxemBalance={this.state.bscNpxsxemBalance}
        migrator={this.state.migrator}
        migrateNPXSXEM={this.migrateNPXSXEM}
        signMessage={this.signMessage}
        release={this.release}
        releaseAll={this.releaseAll}
        bscTransfer={this.bscTransfer}
        bscSignMessage={this.bscSignMessage}
      />
      content3 = <PurseDistribute
        account={this.state.account}
        purseTokenBalance={this.state.purseTokenBalance}
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
                    <Route path="/YieldFarm_BridgeEthBsc/" exact > {content} </Route>
                    <Route path="/YieldFarm_BridgeEthBsc/NPXSXEMigration" exact > {content2} </Route>
                    <Route path="/YieldFarm_BridgeEthBsc/PurseDistribution" exact > {content3} </Route>
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
