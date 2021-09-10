// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./PurseTokenUpgradable.sol";


contract NPXSXEMigration {
    event Migrate (uint32 migrateIndex, address indexed _from, address _to,  uint256 value);

    string public name = "NPXSXEM Migration";
    address public npxsxemToken;
    PurseTokenUpgradable public purseToken;
    uint256 public constant validDuration = 91 days;
    uint256 internal migrationStart;
    address public owner;

    uint32 public migrateIndex;
    mapping(uint32 => MigratorInfo) public migration;  //index->times   
    mapping(address => bool) public isOwner;    

    struct MigratorInfo {
        uint32 migrateIndex;
        address migrator;
        address to;
        uint256 migrateBalance;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    constructor(address _npxsxemToken, PurseTokenUpgradable _purseToken) {
        isOwner[msg.sender] = true;
        owner = msg.sender;
        npxsxemToken = _npxsxemToken;
        purseToken = _purseToken;
        migrationStart = block.timestamp;
    }

    function migrateNPXSXEM(address _to, uint256 _amount) public {     
        uint256 remainingAmount = purseToken.balanceOf(address(this)); 
        uint256 end = migrationStart + validDuration;
        require(block.timestamp <= end, "Migration window over");
        require(_amount > 0);
        require(remainingAmount >=_amount);

        uint256 transferAmount = (_amount * 12) / 100;
        ERC20Interface(npxsxemToken).transferFrom(msg.sender, address(this), _amount);
        // npxsxemToken.transferFrom(msg.sender, address(this), _amount);      // Migrate npxsxem token   
        purseToken.transfer(_to, transferAmount);
        migration[migrateIndex] = MigratorInfo(migrateIndex, msg.sender, _to, _amount );
        
        emit Migrate(migrateIndex, msg.sender, _to, _amount);
        migrateIndex += 1;
    }

    function airDrop(uint32 start, uint32 end) public onlyOwner {
        for (uint32 i = start; i <= end; i++) {
            address recipient = migration[i].to;
            uint256 amount = migration[i].migrateBalance * 8 / 100;
            purseToken.transfer(recipient, amount);
        }
    }

    function returnPurseToken(address _to) public onlyOwner {
        require(_to != address(0), "send to the zero address");
        uint256 remainingAmount = purseToken.balanceOf(address(this));
        purseToken.transfer(_to, remainingAmount);
    }
    
    function returnAnyToken(address token, uint256 amount, address _to) public onlyOwner {
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
