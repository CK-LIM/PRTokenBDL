pragma solidity ^0.8.0;

import "./NPXSXEMToken.sol";
import "./PurseToken.sol";

contract NPXSXEMigrationV0 {
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
        uint256 migrateBalance;
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
        require(block.timestamp <= end, "Migration window over");
        npxsxemToken.transferFrom(msg.sender, address(this), _amount); // Migrate npxsxem token
        migrateCount[msg.sender] += 1;
        releaseIteration[msg.sender][migrateCount[msg.sender]] = 10;
        uint256 transferAmount = (_amount * tokenBurnRate * 12) / 100;
        require(transferAmount > 0);
        purseToken.transfer(msg.sender, transferAmount);

        for (uint256 i = 0; i < 11; i++) {
            uint256 unlockTimeStamp = block.timestamp + (releaseDuration*i);
            migrator[msg.sender][migrateCount[msg.sender]][i] = migratorInfo(migrateCount[msg.sender],i,_amount, unlockTimeStamp, true);
        }
    }

    // notice Transfers tokens held by timelock to beneficiary.
    function release(uint256 _migrateCount, uint256 _releaseIteration) public {
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= migrator[msg.sender][_migrateCount][_releaseIteration].unlockTime, 'locked period');
        require(migrator[msg.sender][_migrateCount][_releaseIteration].isRedeem == true, 'have been redeem');

        migrator[msg.sender][_migrateCount][_releaseIteration].isRedeem = false;

        uint256 migrateAmount = (migrator[msg.sender][_migrateCount][_releaseIteration].migrateBalance * tokenBurnRate * 8) / 100;
        require(migrateAmount > 0);
        purseToken.transfer(msg.sender, migrateAmount);
    }
}
