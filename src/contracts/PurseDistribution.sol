// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./PurseTokenUpgradable.sol";

contract PurseDistribution {
    event claimReward(address indexed owner, uint256 amount, uint32 indexed Iteration);
    event claimAllReward(address indexed owner, uint256 amount, uint32 Iteration_End);
    event addHolder(address indexed sender, uint32 iteration);
    event updateHolder(address indexed sender, uint32 iteration);
    
    string public name = "Purse Distribution";
    PurseTokenUpgradable public purseToken;
    address public owner;
    uint256 public constant validDuration = 91 days;
    uint256 internal distributionStart;
    mapping(address => bool) public isOwner;
    mapping(address => mapping(uint32 => holderInfo)) public holder;   //address->index   
    mapping(uint32 => uint256) public numOfHolder;


    struct holderInfo {
        uint256 distributeAmount;
        bool isRedeem;
    }
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    constructor(PurseTokenUpgradable _purseToken) {
        purseToken = _purseToken;
        isOwner[msg.sender] = true;
        owner = msg.sender;
        distributionStart = block.timestamp;
    }

    function addHolderInfo(address[] calldata _holder, uint256[] calldata _amount , uint32 iteration) public onlyOwner {
        uint256 end = distributionStart + validDuration;
        require(block.timestamp <= end, "Distribution window over");
        uint256 i = 0;
        require(_holder.length == _amount.length, "length difference");
        for (i; i < _holder.length; i++) {
            holder[_holder[i]][iteration] = holderInfo(_amount[i], true);
        }
        numOfHolder[iteration] += _holder.length;
        emit addHolder(msg.sender, iteration);
    }

    function updateHolderInfo(address[] calldata _holder, uint256[] calldata _amount , uint32 iteration) public onlyOwner {
        uint256 end = distributionStart + validDuration;
        require(block.timestamp <= end, "Distribution window over");
        uint256 i = 0;
        require(_holder.length == _amount.length, "length difference");
        for (i; i < _holder.length; i++) {
            holder[_holder[i]][iteration] = holderInfo(_amount[i], true);
        }
        emit updateHolder(msg.sender, iteration);
    }

    // Notice Transfers tokens held by timelock to beneficiary.
    function claim(uint32 iteration) public {
        uint256 end = distributionStart + validDuration;
        require(block.timestamp <= end, "Distribution window over");
        require(holder[msg.sender][iteration].isRedeem == true, 'have been redeem');

        holder[msg.sender][iteration].isRedeem = false;
        uint256 claimAmount = holder[msg.sender][iteration].distributeAmount;
        purseToken.transfer(msg.sender, claimAmount);
        emit claimReward(msg.sender, claimAmount, iteration);
    }

    function claimAll(uint32 iteration_end) public {
        uint256 end = distributionStart + validDuration;
        require(block.timestamp <= end, "Distribution window over");
        uint256 claimAmount = 0;
        for (uint32 i = 0; i <= iteration_end; i++) {
                if (holder[msg.sender][i].isRedeem == true) {
                    require(holder[msg.sender][i].isRedeem == true, 'have been redeem');
                    holder[msg.sender][i].isRedeem = false;
                    uint256 holderAmount = holder[msg.sender][i].distributeAmount;
                    claimAmount += holderAmount;                    
                }
        }
        if (claimAmount > 0) {
            purseToken.transfer(msg.sender, claimAmount);
        }
        emit claimAllReward(msg.sender, claimAmount, iteration_end);
    }
    
    function returnPurseToken(address _to) public onlyOwner {
        require(_to != address(0), "send to the zero address");
        uint256 remainingAmount = purseToken.balanceOf(address(this));
        purseToken.transfer(_to, remainingAmount);
    }

    function returnAnyToken(address token, uint256 amount, address _to) public onlyOwner{
        require(_to != address(0), "send to the zero address");
        ERC20Interface(token).transfer(_to, amount);
    } 

    function updateOwner(address _owner) public onlyOwner{
        require(_owner != address(0), "not valid address");
        require(_owner != owner, "same owner address");
        isOwner[_owner] = true;
        owner = _owner;
    } 
}
