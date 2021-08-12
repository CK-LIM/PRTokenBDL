pragma solidity ^0.8.0;

import "./XToken.sol";
import "./LPXToken.sol";
import "./PurseToken.sol";

contract TokenFarm {
    string public name = "X Token Farm";
    XToken public xToken;
    LPXToken public lpXToken;
    PurseToken public purseToken;
    address public owner;
    address[] public stakers;
    uint256 internal tokenBurnRate = 2;
    uint256 public constant duration = 1 days;
    uint256 public constant penaltyRate = 20;
    uint256 public decimalFlow = 1000000;

    FarmInfo public farmInfo;
    mapping(address => StakerInfo) public stakerInfo;

    struct StakerInfo {
        uint256 stakingBalance;
        uint256 rewardBalance;
        uint256 stakingTimestamp;
        uint256 stakingBlock;
        bool hasStaked;
        bool isStaking;
        uint256 poolShareRatio;
    }

    struct FarmInfo {
        uint256 blockReward;
        uint256 lastRewardBlock; // Last block number that reward distribution occurs.
        uint256 farmableSupply; // set in init, total amount of tokens farmable
    }

    constructor (XToken _xToken, LPXToken _lpXToken, PurseToken _purseToken, uint256 _blockReward) public {
        xToken = _xToken;
        lpXToken = _lpXToken;
        purseToken = _purseToken;
        farmInfo.blockReward = _blockReward;
        owner = msg.sender;
    }

    // Stakes Tokens
    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        updateRewardTokens();
        xToken.transferFrom(msg.sender, address(this), _amount); // Stake x token
        stakerInfo[msg.sender].stakingBalance += _amount;
        stakerInfo[msg.sender].stakingTimestamp = block.timestamp;
        // stakerInfo[msg.sender].stakingBlock = block.number;

        if (!stakerInfo[msg.sender].hasStaked) {
            stakers.push(msg.sender);
        }

        //Update staking status
        stakerInfo[msg.sender].isStaking = true;
        stakerInfo[msg.sender].hasStaked = true;

        lpXToken.transfer(msg.sender, _amount);
        getTotalBalance();
        // getPoolShareRatio();
    }

    // Unstacking Tokens
    function unstakeTokens() public {
        updateRewardTokens();
        uint256 balance = stakerInfo[msg.sender].stakingBalance;
        require(balance > 0, "staking balance cannot be 0");
        uint256 end = stakerInfo[msg.sender].stakingTimestamp + duration;
        require(block.timestamp >= end, "too early to withdraw Tokens");
        xToken.transfer(msg.sender, balance); // withdraw dai token
        lpXToken.transferFrom(msg.sender, address(this), balance); //return lpX token

        stakerInfo[msg.sender].stakingBalance = 0;
        stakerInfo[msg.sender].isStaking = false;
        getTotalBalance();
        // getPoolShareRatio();
    }

    // Issuing Tokens
    function issueTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");

        // Only owner can call this function
        require(msg.sender == owner, "caller must be owner");
        getTotalBalance();

        if (farmInfo.farmableSupply == 0) {
            farmInfo.lastRewardBlock = block.number;
            return;
        }

        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakerInfo[recipient].stakingBalance;
            uint256 amount = (farmInfo.blockReward * balance) /
                farmInfo.farmableSupply;

            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - farmInfo.lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                stakerInfo[recipient].rewardBalance += totalamount; //Update reward balance
            }
        }
        farmInfo.lastRewardBlock = block.number;
    }

    // Issuing Tokens for internal
    function updateRewardTokens() public {
        getTotalBalance();

        if (farmInfo.farmableSupply == 0) {
            farmInfo.lastRewardBlock = block.number;
            return;
        }
        //update reward tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakerInfo[recipient].stakingBalance;
            // uint256 ratio = (balance * 100 * decimalFlow) / farmInfo.farmableSupply;
            uint256 amount = (farmInfo.blockReward * balance) /
                farmInfo.farmableSupply;

            uint256 blknumbernow = block.number;
            uint256 diffofblk = blknumbernow - farmInfo.lastRewardBlock;
            uint256 totalamount = amount * diffofblk;

            if (totalamount > 0) {
                stakerInfo[recipient].rewardBalance += totalamount; //Update reward balance
            }
        }
        farmInfo.lastRewardBlock = block.number;
    }

    // Emergency Unstacking Tokens to withdraw LP tokens with penalty
    function emergencyUnstakeTokens() public {
        updateRewardTokens();
        uint256 balance = stakerInfo[msg.sender].stakingBalance;
        require(balance > 0, "staking balance cannot be 0");
        uint256 penalty = (balance * penaltyRate) / 100;
        uint256 remainingBalance = balance - penalty;
        xToken.transfer(msg.sender, remainingBalance); // Unstake x token
        xToken.transfer(address(this), penalty); // Unstake penalty x token
        lpXToken.transferFrom(msg.sender, address(this), balance); //return lpx token

        stakerInfo[msg.sender].stakingBalance = 0;
        stakerInfo[msg.sender].isStaking = false;
        getTotalBalance();
        // getPoolShareRatio();
    }

    function getTotalBalance() public {
        uint256 totalBalance;
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakerInfo[recipient].stakingBalance;
            totalBalance = balance + totalBalance;
        }
        farmInfo.farmableSupply = totalBalance;
    }

    function getPoolShareRatio() public {
        if (farmInfo.farmableSupply == 0) {
            for (uint256 i = 0; i < stakers.length; i++) {
                address recipient = stakers[i];
                stakerInfo[recipient].poolShareRatio = 0;
            }
        } else {
            for (uint256 i = 0; i < stakers.length; i++) {
                address recipient = stakers[i];
                uint256 balance = stakerInfo[recipient].stakingBalance;
                uint256 ratio = (balance * 100 * decimalFlow) /
                    farmInfo.farmableSupply;
                stakerInfo[recipient].poolShareRatio = ratio;
            }
        }
    }

    function transferOwnership(address _to, uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        require(_to == address(_to), "Invalid address");
        uint256 balance = stakerInfo[msg.sender].stakingBalance;
        require(_amount <= balance, "amount more than LP balance");
        updateRewardTokens();
        lpXToken.transferFrom(msg.sender, _to, _amount); //transfer lpXToken
        stakerInfo[msg.sender].stakingBalance -= _amount;

        stakerInfo[_to].stakingBalance += (_amount); //Update staking balance
        stakerInfo[_to].stakingTimestamp = stakerInfo[msg.sender]
        .stakingTimestamp;

        if (!stakerInfo[_to].hasStaked) {
            stakers.push(_to);
        }

        //Update staking status
        stakerInfo[_to].isStaking = true;
        stakerInfo[_to].hasStaked = true;

        getTotalBalance();
        // getPoolShareRatio();
    }

    function redeemToken(uint256 _amount) public {
        updateRewardTokens();
        require(_amount > 0, "amount cannot be 0");
        uint256 balance = stakerInfo[msg.sender].rewardBalance;
        require(_amount <= balance, "amount more than reward balance");
        purseToken.transfer(msg.sender, _amount * tokenBurnRate); // Redeem reward token
    }
}
