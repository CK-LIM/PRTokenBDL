// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./PurseTokenMultiSigUpgradable.sol";

contract PurseDistribution {
    string public name = "Purse Distribution";
    PurseTokenMultiSigUpgradable public purseToken;
    address public owner;

    // mapping(address => uint256) public releaseIteration;
    mapping(address => holderInfo) public holder;  //address->index   

    struct holderInfo {
        uint256 distributeAmount;
        bool isRedeem;
    }

    constructor(PurseTokenMultiSigUpgradable _purseToken) public {
        purseToken = _purseToken;
        owner = msg.sender;
    }

    function updateHolderInfoFirst(address _holder, uint256 _amount) public {
        require(msg.sender == owner, 'only owner');
        require(_amount >= 0, 'amount less than 0');
        holder[_holder] = holderInfo( _amount, true);
        // releaseIteration[_holder] = 1;
        // uint256 i = 0;
        // for (i; i < _holder.length; i++) {
        //     holder[_holder[i]][1] = holderInfo(1, _amount[i], true);
        //     releaseIteration[_holder[i]] = 1;     
        // }
    }

    // Notice Transfers tokens held by timelock to beneficiary.
    function claim() public {
        require(holder[msg.sender].isRedeem == true, 'have been redeem');

        holder[msg.sender].isRedeem = false;
        uint256 claimAmount = holder[msg.sender].distributeAmount;
        purseToken.transfer(msg.sender, claimAmount);
    }

    // notice Transfers tokens held by timelock to beneficiary.
    // function claimAll() public {
    //     uint256 claimAmount = 0;
    //     for (uint256 i = 1; i <= releaseIteration[msg.sender]; i++) {
    //             if (holder[msg.sender][i].isRedeem == true) {
    //                 holder[msg.sender][i].isRedeem = false;
    //                 uint256 holderAmount = holder[msg.sender][i].distributeAmount;
    //                 claimAmount += holderAmount;                    
    //             }
    //     }
    //     if (claimAmount > 0) {
    //         purseToken.transfer(msg.sender, claimAmount);
    //     }        
    // }
}
