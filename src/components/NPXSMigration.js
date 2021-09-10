import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import x from '../x.png'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from '@material-ui/core/Button';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

class NPXSMigration extends Component {

    constructor(props) {
        super(props)
        this.state = {
            message: ''
        }
        this.state = {
            messageAdd: ''
        }
        this.state = {
            txValidAdd: false,
            txValidAmount: false
        }
        this.clickHandler = this.clickHandler.bind(this)
        this.clickHandlerInfo = this.clickHandlerInfo.bind(this)
        // this.changeHandler = this.changeHandler.bind(this)
    }

    clickHandler() {
        // console.log("clicked")
        this.setState({
            message: ''
        })
        // if (result === false) {
        //     alert ("Not a value")
        // }
    }

    clickHandlerInfo() {
        // console.log("clicked")
        this.setState({
            messageInfo: 'This Nonce value is to identify each migration from the same address. Please input unique value(Max: 4 digits) for each migration.'
        })
    }

    changeHandler(event) {
        let result = !isNaN(+event); // true if its a number, false if not
        if (event == "") {
            this.setState({
                message: ''
            })
            this.setState({
                txValidAmount: false
            })
        } else if (result == false) {
            this.setState({
                message: 'Not a valid number'
            })
            this.setState({
                txValidAmount: false
            })
            // console.log(this.state.txValid)
        } else if (event <= 0) {
            this.setState({
                message: 'Value need to be greater than 0'
            })
            this.setState({
                txValidAmount: false
            })
        }
        else {
            this.setState({
                message: ''
            })
            this.setState({
                txValidAmount: true
            })
        }
    }

    changeHandlerAdd(event) {
        // console.log(event)
        if (event == "") {
            this.setState({
                messageAdd: ''
            })
        } else if (event !== "") {
            let result = window.web3.utils.isAddress(event); // true if its a number, false if not
            // console.log(result)
            if (result == false) {
                this.setState({
                    messageAdd: 'Not a valid BEP-20 Address'
                })
                this.setState({
                    txValid: false
                })
            } else {
                this.setState({
                    messageAdd: ''
                })
                this.setState({
                    txValid: true
                })
            }
        }

    }

    render() {
        return (
            <div id="content" className="mt-3" >
                <div className="text-center">
                    <ButtonGroup>
                        {/* <Button variant="outlined" color="default" component={Link} to="/PRTokenDistribution/">Liquidity Pool</Button> */}
                        <Button variant="contained" color="default" component={Link} to="/PRTokenBDL/NPXSXEMigration/">Migrate NPXSXEM</Button>
                        <Button variant="outlined" color="default" component={Link} to="/PRTokenBDL/PurseDistribution/">Purse Distribution</Button>
                    </ButtonGroup>
                </div>
                &nbsp;
                {/* ******************************************Migrate NPXSXEM on Binance Chain BEP2******************************************** */}
                <h2 className="table table-borderless text-muted text-center">Migrate NPXSXEM Token!</h2>&nbsp;

                <div className="card mb-4 card-body" >
                    <form className="mb-3" onSubmit={(event) => {
                        event.preventDefault()
                        let amountWei = window.web3.utils.toWei(this.transferValue.value, 'Ether')
                        let amount = amountWei.toString()
                        let toAdd = this.recipient.value.toString()
                        if (this.state.txValidAmount === false) {
                            alert("Invalid input! PLease check your input again")
                        } else {
                            this.props.migrateNPXSXEM(toAdd, amount)
                        }
                    }}>
                        <div>
                            <label className="float-left"><b>Migrate NPXSXEM Token</b></label>
                            <span className="float-right text-muted">
                                <div>NPXSXEM Balance ({this.props.first4Account}...{this.props.last4Account}) : {window.web3.utils.fromWei(this.props.npxsxemTokenBalance, 'Ether')}</div>
                                <div>PURSE Balance ({this.props.first4Account}...{this.props.last4Account}) : {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}</div>
                            </span>
                        </div>
                        <br /><br />
                        <div><label className="float-left">&nbsp;Recipient Address:</label></div>
                        <div className="input-group mb-4">
                            <input
                                id="recipient"
                                type="text"
                                ref={(input) => { this.recipient = input }}
                                className="form-control form-control-lg"
                                placeholder="0x"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // console.log(value)
                                    this.changeHandlerAdd(value)
                                }
                                }
                                required />
                        </div>
                        <div style={{ color: 'red' }}>{this.state.messageAdd}</div>

                        <div><label className="float-left">&nbsp;Migrate Amount:</label></div>
                        <div className="input-group mb-4">
                            <input
                                id="transferValue"
                                type="text"
                                ref={(input) => { this.transferValue = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // console.log(value)
                                    this.changeHandler(value)
                                }
                                }
                                required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={x} height='32' alt="" />
                                    &nbsp;&nbsp;&nbsp; NPXSXEM
                                </div>
                            </div>
                        </div>
                        <div style={{ color: 'red' }}>{this.state.message}</div>

                        {/* <div><label className="float-left">&nbsp;Nonce:&nbsp;<BsFillQuestionCircleFill onClick={this.clickHandlerInfo} />&nbsp;</label></div>
                        <div style={{ color: 'black' }}>{this.state.messageInfo}</div>
                        <div className="input-group mb-4">
                            <input
                                id="nonce"
                                type="text"
                                ref={(input) => { this.nonce = input }}
                                className="form-control form-control-lg"
                                placeholder="0"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    console.log(value)
                                    this.changeHandlerNonce(value)
                                }
                                }
                                required />
                        </div>
                        <div style={{ color: 'red' }}>{this.state.messageNonce}</div> */}
                        <button type="submit" className="btn btn-primary btn-block btn-lg">MIGRATE</button>
                    </form>
                </div>


                {/* ********************************* show Token old************************************ */}
                <div className="card mb-4 card-body" >
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Migrator Address</th>
                            <th scope="col">Recipient Address</th>
                            <th scope="col">Amount</th>
                            {/* <th scope="col">Unlock date (GMT)</th> */}
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="claimList">
                        {this.props.migrator.map((migratorInfo, key) => {
                            return (
                                <tr key={key}>
                                    <td>{migratorInfo.migrator}</td>
                                    <td>{migratorInfo.to}</td>
                                    <td>{window.web3.utils.fromWei((migratorInfo.migrateBalance).toString(), 'Ether')} NPXSXEM</td>
                                    <td>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        );
    }
}


export default NPXSMigration;
