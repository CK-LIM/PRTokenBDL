import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import './App.css';
import farmer from '../farmer.png'

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={farmer} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Pundi X Reward Token - Purse
        </a>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap-small d-none d-sm-none d-sm-block">
            <span className="text-light">
              <a id="account">{this.props.account}</a>
            </span>
          </li>
        </ul>
      </nav>




    );
  }
}

export default Navbar;
