pragma solidity ^0.8.0;

import "./NPXSXEMToken.sol";
import "./PurseToken.sol";

contract NPXSXEMigration {
    string public name = "NPXSXEM Migration";
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
        purseToken = _purseToken;
        owner = msg.sender;
        migrationStart = block.timestamp;
    }

    function migrateNPXSXEM(uint256 _amount) public {
        uint256 end = migrationStart + validDuration;
        require(_amount >= 0, 'amount less than 0');
        require(block.timestamp <= end, "Migration window over");
        migrateCount[msg.sender] += 1;
        uint256 transferAmount = _amount * tokenBurnRate;
        purseToken.transfer(msg.sender, transferAmount);

    }

}
