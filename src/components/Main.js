import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import x from '../x.png'
import pteria from '../pteria.png'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from '@material-ui/core/Button';

class Main extends Component {

    render() {
        return (
            <div id="content" className="mt-3">
                <div className="text-center">
                    <ButtonGroup>
                        <Button variant="contained" color="default" component={Link} to="/PRTokenDistribution/">Liquidity Pool</Button>
                        <Button variant="outlined" color="default" component={Link} to="/PRTokenDistribution/NPXSXEMigration/">Migrate NPXSXEM</Button>
                        <Button variant="outlined" color="default" component={Link} to="/PRTokenDistribution/PurseDistribution/">Purse Distribution</Button>
                    </ButtonGroup>
                </div>
                &nbsp;
                {/* <a className="nav-links ">
                    <Link className="text-dark text-center" to='/YieldFarm_BridgeEthBsc/'><li>Liquidity Pool</li></Link>
                    <Link className="text-dark text-center" to='/YieldFarm_BridgeEthBsc/NPXSXEMigration'><li>Migrate NPXSXEM </li></Link>
                    <Link className="text-dark text-center" to='/YieldFarm_BridgeEthBsc/PurseDistribution'><li>Purse Distribution </li></Link>
                </a> */}

                <button
                    type="submit"
                    className="btn btn-primary btn-block btn-sm"
                    style={{ maxWidth: '180px' }}
                    onClick={(event) => {
                        event.preventDefault()
                        this.props.updateRewardTokens()
                    }}>
                    Update Reward Balance
                </button>&nbsp;

                <h1 className="table table-borderless text-muted text-center">Stake Token!</h1>&nbsp;
                <h3 className="table table-borderless text-muted text-center">Pool Info</h3>
                <table className="table table-borderless text-muted text-center">
                    <thead>
                        <tr>
                            <th scope="col">Block Reward</th>
                            <th scope="col">Pool Staking Balance</th>
                            <th scope="col">Pool LPX Balance</th>
                            <th scope="col">Pool PURSE Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{window.web3.utils.fromWei(this.props.farmInfo.blockReward, 'Ether')} Purse</td>
                            <td>{window.web3.utils.fromWei(this.props.farmInfo.farmableSupply, 'Ether')} X</td>
                            <td>{window.web3.utils.fromWei(this.props.lpXTokenBalance_farm, 'Ether')} TF.LPX</td>
                            <td>{window.web3.utils.fromWei(this.props.purseTokenBalance_farm, 'Ether')} TF.PURSE</td>
                        </tr>
                    </tbody>
                </table>
                <h3 className="table table-borderless text-muted text-center">Staker Info</h3>
                <table className="table table-borderless text-muted text-center">
                    <thead>
                        <tr>
                            <th scope="col">Staking Balance</th>
                            <th scope="col">LPX Token Balance</th>
                            <th scope="col">Your Pool Share</th>
                            <th scope="col">Your Reward Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{window.web3.utils.fromWei(this.props.stakerInfo.stakingBalance, 'Ether')} X</td>
                            <td>{window.web3.utils.fromWei(this.props.lpXTokenBalance, 'Ether')} LPX</td>
                            <td>{this.props.stakerInfo.poolShareRatio / 1000000} %</td>
                            <td>{window.web3.utils.fromWei(this.props.stakerInfo.rewardBalance, 'Ether')} PURSE</td>
                        </tr>
                    </tbody>
                </table>
                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let amount
                        amount = this.input.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        this.props.stakeTokens(amount)
                    }}>
                        <div>
                            <label className="float-left"><b>Stake Tokens</b></label>
                            <span className="float-right text-muted">
                                X Balance: {window.web3.utils.fromWei(this.props.xTokenBalance, 'Ether')}
                            </span>
                        </div>
                        <div className="input-group mb-4">
                            <input
                                type="text"
                                ref={(input) => { this.input = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={x} height='32' alt="" />
                                    &nbsp;&nbsp;&nbsp; X
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
                    </form>
                    <button
                        type="submit"
                        className="btn btn-link btn-block btn-sm"
                        onClick={(event) => {
                            event.preventDefault()
                            let amount
                            amount = window.web3.utils.fromWei(this.props.lpXTokenBalance, 'Ether')
                            amount = window.web3.utils.toWei(amount, 'Ether')
                            this.props.unstakeTokens(amount)
                        }}>
                        UN-STAKE...
                    </button>
                    <button
                        type="submit"
                        className="btn btn-link btn-block btn-sm"
                        onClick={(event) => {
                            event.preventDefault()
                            let amount
                            amount = window.web3.utils.fromWei(this.props.lpXTokenBalance, 'Ether')
                            amount = window.web3.utils.toWei(amount, 'Ether')
                            this.props.emergencyUnstakeTokens(amount)
                        }}>
                        EMERGENCY UN-STAKE...
                    </button>
                </div>
                &nbsp;
                {/* ******************************************Redeem PURSE ******************************************** */}

                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let amount
                        amount = this.redeemValue.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        this.props.redeemToken(amount)
                    }}>
                        <div>
                            <label className="float-left"><b>Redeem PURSE reward</b></label>
                            <span className="float-right text-muted">
                                <div>Reward Balance: {window.web3.utils.fromWei(this.props.stakerInfo.rewardBalance, 'Ether')}</div>
                                <div>PURSE Balance: {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}</div>
                            </span>
                        </div>

                        <div className="input-group mb-4">
                            <input
                                id="redeemValue"
                                type="text"
                                ref={(input) => { this.redeemValue = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={pteria} height='32' alt="" />
                                    &nbsp;&nbsp;&nbsp; PURSE
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">REDEEM</button>
                    </form>
                </div>

                {/* ******************************************Transfer LPX ownership******************************************** */}

                &nbsp;

                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let amount
                        amount = this.transfervalue.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        let address
                        address = this.recipient.value.toString()
                        // let result = window.web3.utils.isAddress(address)
                        // console.log(result)   
                        this.props.transferOwnership(address, amount)
                    }}>
                        <div>
                            <label className="float-left"><b>Transfer LPX Ownership</b></label>
                            <span className="float-right text-muted">
                                LPX Balance: {window.web3.utils.fromWei(this.props.lpXTokenBalance, 'Ether')}
                            </span>
                        </div>
                        <div className="input-group mb-4">
                            <input
                                id="recipient"
                                type="text"
                                ref={(input) => { this.recipient = input }}
                                className="form-control form-control-lg"
                                placeholder="Public address (0x)"
                                required />
                        </div>

                        <div className="input-group mb-4">
                            <input
                                id="transfervalue"
                                type="text"
                                ref={(input) => { this.transfervalue = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={x} height='32' alt="" />
                                    &nbsp;&nbsp;&nbsp; LPX
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">TRANSFER</button>
                    </form>
                </div>

                {/* ******************************************Transfer bridge Eth-Bsc token******************************************** */}

                &nbsp;

                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let address = this.bridgeRecipient.value.toString()
                        let amount = this.bridgeTransferValue.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        let nonce = this.nonce.value.toString()
                        this.props.signMessage(address, amount, nonce);

                    }}>
                        <div>
                            <label className="float-left"><b>PURSE Token Bridge: Ethereum &lt;--&gt; BSC</b></label>
                            <span className="float-right text-muted">
                                PURSE Balance: {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}
                            </span>
                        </div>
                        <div className="input-group mb-4">
                            <input
                                id="bridgeRecipient"
                                type="text"
                                ref={(input) => { this.bridgeRecipient = input }}
                                className="form-control form-control-lg"
                                placeholder="Public address (0x)"
                                required />
                        </div>

                        <div className="input-group mb-4">
                            <input
                                id="bridgeTransferValue"
                                type="text"
                                ref={(input) => { this.bridgeTransferValue = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                required />

                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={pteria} height='32' alt="" />
                                    &nbsp;&nbsp;&nbsp; PURSE
                                </div>
                            </div>
                        </div>

                        <div className="input-group mb-4">
                            <input
                                id="nonce"
                                type="text"
                                ref={(input) => { this.nonce = input }}
                                className="form-control form-control-lg"
                                placeholder="Nonce"
                                required />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg">SIGN & SEND</button>
                    </form>
                </div>




            </div>
        );
    }
}

export default Main;
