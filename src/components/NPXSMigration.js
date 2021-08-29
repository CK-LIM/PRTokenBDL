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
            messageNonce: ''
        }
        this.state = {
            txValid: false,
        }
        this.clickHandler = this.clickHandler.bind(this)
        this.clickHandlerInfo = this.clickHandlerInfo.bind(this)
        // this.changeHandler = this.changeHandler.bind(this)
    }

    clickHandler() {
        console.log("clicked")
        this.setState({
            message: ''
        })
        // if (result === false) {
        //     alert ("Not a value")
        // }
    }

    clickHandlerInfo() {
        console.log("clicked")
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
                txValid: false
            })
        } else if (result == false) {
            this.setState({
                message: 'Value need to be number'
            })
            this.setState({
                txValid: false
            })
            console.log(this.state.txValid)
        } else if (event <= 0) {
            this.setState({
                message: 'Value need to be greater than 0'
            })
            this.setState({
                txValid: false
            })
        }
        else {
            this.setState({
                message: ''
            })
            this.setState({
                txValid: true
            })
        }
    }

    changeHandlerNonce(event) {
        let result = !isNaN(+event); // true if its a number, false if not
        if (event == "") {
            this.setState({
                messageNonce: ''
            })
            this.setState({
                txValid: false
            })
        } else if (result == false) {
            this.setState({
                messageNonce: 'Nonce need to be number'
            })
            this.setState({
                txValid: false
            })
        } else if (event <= 0) {
            this.setState({
                messageNonce: 'Nonce need to be greater than 0'
            })
            this.setState({
                txValid: false
            })
        }
        else if (event.length >= 5) {
            this.setState({
                messageNonce: 'Nonce need to be less than 4 digits'
            })
            this.setState({
                txValid: false
            })
        }
        else if (event.charAt(0) == 0) {
            this.setState({
                messageNonce: 'First character cannot be 0'
            })
            this.setState({
                txValid: false
            })
        }
        else {
            this.setState({
                messageNonce: ''
            })
            this.setState({
                txValid: true
            })
        }
    }

    changeHandlerAdd(event) {
        console.log(event)
        if (event == "") {
            this.setState({
                messageAdd: ''
            })
        } else if (event !== "") {
            let result = window.web3.utils.isAddress(event); // true if its a number, false if not
            console.log(result)
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
                        let amount = this.transferValue.value.toString()
                        let toAdd = this.recipient.value.toString()
                        let nonce = this.nonce.value.toString()
                        let memo = toAdd + nonce
                        console.log(memo)
                        if (this.state.txValid === false) {
                            alert("Invalid input! PLease check your input again")
                        } else {
                            this.props.bscTransfer(amount, memo)
                        }
                    }}>
                        <div>
                            <label className="float-left"><b>Migrate NPXSXEM Token(BEP-2)</b></label>
                            <span className="float-right text-muted">
                                <div>BNB Balance ({this.props.bscAccount}) : {this.props.bscNpxsxemBalance}</div>
                                <div>PURSE Balance ({this.props.account}) : {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}</div>
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
                                    console.log(value)
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
                                    console.log(value)
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

                        <div><label className="float-left">&nbsp;Nonce:&nbsp;<BsFillQuestionCircleFill onClick={this.clickHandlerInfo} />&nbsp;</label></div>
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
                        <div style={{ color: 'red' }}>{this.state.messageNonce}</div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg">MIGRATE</button>
                    </form>
                </div>

            </div>
        );
    }
}


export default NPXSMigration;
