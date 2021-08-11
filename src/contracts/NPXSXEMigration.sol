pragma solidity ^0.8.0;

import "./NPXSXEMToken.sol";
import "./PurseToken.sol";

contract NPXSXEMigration {
    string public name = "NPXSXEM Migration";
    NPXSXEMToken public npxsxemToken;
    PurseToken public purseToken;
    address public owner;
    uint256 public constant validDuration = 3 days;
    uint256 public constant releaseDuration = 1 minutes;
    uint256 internal tokenBurnRate = 2;
    uint256 internal migrationStart;

    mapping(address => uint256) public migrateCount;
    mapping(address => mapping (uint256 => uint256)) public releaseIteration;
    mapping(address => mapping (uint256 => mapping (uint256 => migratorInfo))) public migrator;  //address->index->times   

    struct migratorInfo {
        uint256 migrateCount;
        uint256 releaseIteration;
        uint256 releaseBalance;
        uint256 unlockTime;
        bool isRedeem;
    }

    constructor(NPXSXEMToken _npxsxemToken, PurseToken _purseToken) public {
        npxsxemToken = _npxsxemToken;
        purseToken = _purseToken;
        owner = msg.sender;
        migrationStart = block.timestamp;
    }

    function migrateNPXSXEM(uint256 _amount) public {
        uint256 end = migrationStart + validDuration;
        require(_amount >= 0, 'amount less than 0');
        require(block.timestamp <= end, "Migration window over");
        migrateCount[msg.sender] += 1;
        releaseIteration[msg.sender][migrateCount[msg.sender]] = 11;
        uint256 transferAmount = (_amount * tokenBurnRate * 12) / 100;
        purseToken.transfer(msg.sender, transferAmount);
        uint256 releaseBalance = (_amount * tokenBurnRate * 8) / 100;

        for (uint256 i = 1; i < 12; i++) {
            uint256 unlockTimeStamp = block.timestamp + (releaseDuration*i);
            migrator[msg.sender][migrateCount[msg.sender]][i] = migratorInfo(migrateCount[msg.sender],i, releaseBalance, unlockTimeStamp, true);
        }
    }

    // notice Transfers tokens held by timelock to beneficiary.
    function release(uint256 _migrateCount, uint256 _releaseIteration) public {
        require(block.timestamp >= migrator[msg.sender][_migrateCount][_releaseIteration].unlockTime, 'locked period');
        require(migrator[msg.sender][_migrateCount][_releaseIteration].isRedeem == true, 'have been redeem');

        uint256 migrateAmount = (migrator[msg.sender][_migrateCount][_releaseIteration].releaseBalance * tokenBurnRate);
        require(migrateAmount >= 0);
        migrator[msg.sender][_migrateCount][_releaseIteration].isRedeem = false;
        purseToken.transfer(msg.sender, migrateAmount);
    }

    // notice Transfers tokens held by timelock to beneficiary.
    function releaseAll() public {
        uint256 claimAmount = 0;
        for (uint256 c = 1; c <= migrateCount[msg.sender]; c++){
            for (uint256 i = 1; i < 12; i++) {
                if (block.timestamp >= migrator[msg.sender][c][i].unlockTime) {
                    if (migrator[msg.sender][c][i].isRedeem == true) {
                        uint256 migrateAmount = (migrator[msg.sender][c][i].releaseBalance * tokenBurnRate);
                        migrator[msg.sender][c][i].isRedeem = false;
                        claimAmount += migrateAmount;
                    }
                }
            }
        }
        if (claimAmount >= 0) {
            purseToken.transfer(msg.sender, claimAmount);
        }        
    }
}
