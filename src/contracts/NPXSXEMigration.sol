pragma solidity ^0.8.0;

import "./PurseToken.sol";

contract NPXSXEMigration {
    string public name = "NPXSXEM Migration";
    PurseToken public purseToken;
    address public owner;
    uint256 public constant validDuration = 3 days;
    uint256 internal tokenBurnRate = 2;
    uint256 internal migrationStart;

    constructor( PurseToken _purseToken) public {
        purseToken = _purseToken;
        owner = msg.sender;
        migrationStart = block.timestamp;
    }

    function migrateNPXSXEM(address to, uint256 _amount) public {
        uint256 end = migrationStart + validDuration;
        require(msg.sender == owner, 'not owner');
        require(_amount >= 0, 'amount less than 0');
        require(block.timestamp <= end, "Migration window over");     
        uint256 transferAmount = _amount * tokenBurnRate;
        purseToken.transfer(to, transferAmount);

    }

}
