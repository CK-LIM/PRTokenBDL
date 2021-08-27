import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import x from '../x.png'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from '@material-ui/core/Button';

class NPXSMigration extends Component {

    constructor(props) {
        super(props)
        this.state = {
            message: ''
        }
        this.state = {
            messageAdd: ''
        }
        this.clickHandler = this.clickHandler.bind(this)
        this.changeHandler = this.changeHandler.bind(this)
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
    changeHandler(event) {
        let result = !isNaN(+event); // true if its a number, false if not
        if (event == "") {
            this.setState({
                message: ''
            })
        } else if (result == false) {
            this.setState({
                message: 'Value need to be number'
            })
        } else if (event <= 0) {
            this.setState({
                message: 'Value need to be greater than 0'
            })
        }
        else {
            this.setState({
                message: ''
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
            } else {
                this.setState({
                    messageAdd: ''
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
                        <Button variant="contained" color="default" component={Link} to="/PRTokenDistribution/NPXSXEMigration/">Migrate NPXSXEM</Button>
                        <Button variant="outlined" color="default" component={Link} to="/PRTokenDistribution/PurseDistribution/">Purse Distribution</Button>
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
                        this.props.bscTransfer(amount, toAdd)
                    }}>
                        <div>
                            <label className="float-left"><b>Migrate NPXSXEM Token(BEP-2)</b></label>
                            <span className="float-right text-muted">
                                <div>BNB Balance: {this.props.bscNpxsxemBalance}</div>
                                <div>PURSE Balance: {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}</div>
                            </span>
                        </div>
                        <div className="input-group mb-4">
                            <input
                                id="recipient"
                                type="text"
                                ref={(input) => { this.recipient = input }}
                                className="form-control form-control-lg"
                                placeholder="Public address (0x)"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    console.log(value)
                                    this.changeHandlerAdd(value)
                                }
                                }
                                required />
                        </div>
                        <div style={{ color: 'red' }}>{this.state.messageAdd}</div>
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
                        <button type="submit" className="btn btn-primary btn-block btn-lg"
                        onClick={this.clickHandler}>MIGRATE</button>
                    </form>
                </div>

            </div>
        );
    }
}


export default NPXSMigration;
