// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PurseDistribution {
    event claimReward(address indexed owner, uint256 amount, uint256 indexed Iteration);
    event claimAllReward(address indexed owner, uint256 amount, uint256 Iteration_End);
    event addHolder(address indexed sender, uint256 iteration);
    event updateHolder(address indexed sender, uint256 iteration);
    
    string public name = "Purse Distribution";
    IERC20 public purseToken;
    address public owner;
    uint256 public constant validDuration = 91 days;
    uint256 public endDistribution;
    bool public isClaimStart;

    mapping(address => mapping(uint256 => holderInfo)) public holder;   //address->index   
    mapping(uint256 => uint256) public numOfHolder;

    struct holderInfo {
        uint256 distributeAmount;
        bool isRedeem;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(IERC20 _purseToken) {
        purseToken = _purseToken;
        owner = msg.sender;
    }

    function addHolderInfo(address[] calldata _holder, uint256[] calldata _amount , uint256 iteration) public onlyOwner {
        uint256 i = 0;
        require(_holder.length == _amount.length, "length difference");
        for (i; i < _holder.length; i++) {
            if (_amount[i] > 0 && holder[_holder[i]][iteration].distributeAmount == 0) {
                holder[_holder[i]][iteration] = holderInfo(_amount[i], false);
                numOfHolder[iteration] += 1;
            }
        }
        emit addHolder(msg.sender, iteration);
    }

    function updateHolderInfo(address[] calldata _holder, uint256[] calldata _amount , uint256 iteration) public onlyOwner {
        uint256 i = 0;
        require(_holder.length == _amount.length, "length difference");
        for (i; i < _holder.length; i++) {
            if (holder[_holder[i]][iteration].isRedeem == true) {
                continue;
            }
            holder[_holder[i]][iteration] = holderInfo(_amount[i], false);
        }
        emit updateHolder(msg.sender, iteration);
    }

    function startClaim(bool check, uint256 _startClaim) public onlyOwner {
        if (check) {
            endDistribution = _startClaim + validDuration;
            isClaimStart = true;
        } else {
            isClaimStart = false;
        }
    }

    function updateEndDistribution(uint256 _endDistribution) public onlyOwner {
        endDistribution = _endDistribution;
    }

    function checkData(address[] calldata _holder, uint256[] calldata _amount, uint256 iteration) public view returns (uint256, bool) {
        uint256 i = 0;
        for (i; i < _holder.length; i++) {
            if (holder[_holder[i]][iteration].distributeAmount != _amount[i]) {
                return (i, false);
            }
        }
        return (i, true);        
    }

    // Notice Transfers tokens held by timelock to beneficiary.
    function claim(uint256 iteration) public {
        require (isClaimStart == true, "Claim is false");
        require(block.timestamp < endDistribution, "Distribution window over");
        require(holder[msg.sender][iteration].isRedeem == false, 'Have been redeem');

        holder[msg.sender][iteration].isRedeem = true;
        uint256 claimAmount = holder[msg.sender][iteration].distributeAmount;
        purseToken.transfer(msg.sender, claimAmount);
        emit claimReward(msg.sender, claimAmount, iteration);
    }

    function claimAll(uint256 iteration_end) public {
        require (isClaimStart == true, "Claim is false");
        require(block.timestamp < endDistribution, "Distribution window over");
        uint256 claimAmount = 0;
        for (uint256 i = 0; i <= iteration_end; i++) {
                if (holder[msg.sender][i].isRedeem == false) {
                    require(holder[msg.sender][i].isRedeem == false, 'have been redeem');
                    holder[msg.sender][i].isRedeem = true;
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
        IERC20(token).transfer(_to, amount);
    } 

    function updateOwner(address _owner) public onlyOwner{
        require(_owner != address(0), "not valid address");
        require(_owner != owner, "same owner address");
        owner = _owner;
    } 
}
