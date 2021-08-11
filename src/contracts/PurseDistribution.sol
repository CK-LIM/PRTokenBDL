pragma solidity ^0.8.0;

import "./PurseToken.sol";

contract PurseDistribution {
    string public name = "Purse Distribution";
    PurseToken public purseToken;
    address public owner;
    uint256 public constant releaseDuration = 1 minutes;
    uint256 internal tokenBurnRate = 2;


    mapping(address => uint256) public releaseIteration;
    mapping(address => mapping (uint256 => holderInfo)) public holder;  //address->index   

    struct holderInfo {
        uint256 releaseIteration;
        uint256 distributeAmount;
        uint256 unlockTime;
        bool isRedeem;
    }

    constructor(PurseToken _purseToken) public {
        purseToken = _purseToken;
        owner = msg.sender;
    }

    function updateHolderInfo(address _holder, uint256 _amount) public {
        require(msg.sender == owner, 'only owner');
        require(_amount >= 0, 'amount less than 0');

        releaseIteration[_holder] = 12;
        uint256 part1Amount = (_amount * 12) / 100;
        uint256 part2Amount = (_amount * 8) / 100;       

        for (uint256 i = 1; i < 13; i++) {
            uint256 unlockTimeStamp = block.timestamp + (releaseDuration*i);
            if (i == 1) {
                holder[_holder][1] = holderInfo(i, part1Amount, unlockTimeStamp, true);
            } else {
                holder[_holder][i] = holderInfo(i, part2Amount, unlockTimeStamp, true);
            }
        }
    }

    // notice Transfers tokens held by timelock to beneficiary.
    function claim(uint256 _releaseIteration) public {
        require(block.timestamp >= holder[msg.sender][_releaseIteration].unlockTime, 'locked period');
        require(holder[msg.sender][_releaseIteration].isRedeem == true, 'have been redeem');

        holder[msg.sender][_releaseIteration].isRedeem = false;
        uint256 claimAmount = holder[msg.sender][_releaseIteration].distributeAmount * tokenBurnRate;
        purseToken.transfer(msg.sender, claimAmount);
    }

    // notice Transfers tokens held by timelock to beneficiary.
    function claimAll() public {
        uint256 claimAmount = 0;
        for (uint256 i = 1; i < 13; i++) {
            if (block.timestamp >= holder[msg.sender][i].unlockTime) {
                if (holder[msg.sender][i].isRedeem == true) {
                    holder[msg.sender][i].isRedeem = false;
                    uint256 holderAmount = holder[msg.sender][i].distributeAmount * tokenBurnRate;
                    claimAmount += holderAmount;                    
                }
            }
        }
        if (claimAmount > 0) {
            purseToken.transfer(msg.sender, claimAmount);
        }        
    }
}