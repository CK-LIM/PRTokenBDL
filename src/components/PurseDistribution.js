import React, { Component } from 'react'
import { Link } from 'react-router-dom';
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/Button';
import { useHistory } from "react-router-dom";
import x from '../x.png'


class PurseDistribute extends Component {

    render() {
        return (
            <div id="content" className="mt-3" >
                <div className="text-center">
                    <ButtonGroup>
                        <Button variant="outlined" color="default" component={Link} to="/PRTokenDistribution/">Liquidity Pool</Button>
                        <Button variant="outlined" color="default" component={Link} to="/CK-LIM.github.io/PRTokenDistribution/NPXSXEMigration/">Migrate NPXSXEM</Button>
                        <Button variant="contained" color="default" component={Link} to="/CK-LIM.github.io/PRTokenDistribution/PurseDistribution/">Purse Distribution</Button>
                    </ButtonGroup>
                </div>
                &nbsp;
                {/* <a className="nav-links">
                    <Link className="nav-links text-center"  role="button" to='/YieldFarm_BridgeEthBsc/'><li>Liquidity Pool</li></Link>
                    <Link className="text-center"  role="button" to='/YieldFarm_BridgeEthBsc/NPXSXEMigration'><li>Migrate NPXSXEM </li></Link>
                    <Link className="text-center"  role="button" to='/YieldFarm_BridgeEthBsc/PurseDistribution'><li>Purse Distribution </li></Link>
                </a>&nbsp; */}
                <h2 className="table table-borderless text-muted text-center">Distribution of $Purse to $PUNDIX holders</h2>&nbsp;

                {/* ******************************************Claim PURSE ******************************************** */}

                <div className="card mb-4 card-body" >
                    <div>
                        <h3 className="table table-borderless text-muted text-center">Claimable PURSE Token(BEP-20)</h3>&nbsp;
                        <span className="float-right text-muted">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-sm"
                                style={{ maxWidth: '100px' }}
                                onClick={(event) => {
                                    event.preventDefault()
                                    this.props.claimAll()
                                }}>
                                Claim All
                            </button>&nbsp;
                        </span>
                    </div>

                    <div>
                        <label className="float-left"><b>Redeem PURSE reward</b></label>
                        <span className="float-right text-muted">
                            <div>PURSE Balance: {window.web3.utils.fromWei(this.props.purseTokenBalance, 'Ether')}</div>
                        </span>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Address</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Unlock date (GMT)</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>

                        <tbody id="claimList">
                            {this.props.holder.map((holderInfo, key) => {
                                return (
                                    <tr key={key}>
                                        {/* <th scope="row">{this.props.account}</th> */}
                                        <td>{this.props.account}</td>
                                        <td>{window.web3.utils.fromWei((holderInfo.distributeAmount).toString(), 'Ether')} PURSE</td>
                                        <td>{new Date(holderInfo.unlockTime * 1000).toString()}</td>
                                        <td>
                                            {holderInfo.isRedeem
                                                ? <button
                                                    iteration={holderInfo.releaseIteration.toString()}
                                                    onClick={(event) => {
                                                        console.log("clicked...")
                                                        console.log(event.target.iteration)
                                                        // this.props.release('1', '1')
                                                        this.props.claim(holderInfo.releaseIteration)
                                                    }}>
                                                    Claim
                                                </button>
                                                : <button type="button" disabled>Claimed</button>
                                            }
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

export default PurseDistribute;
