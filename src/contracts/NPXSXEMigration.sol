// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NPXSXEMigration {
    event Migrate (uint256 migrateIndex, address indexed _from, address _to,  uint256 value);

    string public name = "NPXSXEM Migration";
    address public npxsxemToken;
    IERC20 public purseToken;
    uint256 public constant validDuration = 91 days;
    uint256 public endMigration;
    address public owner;
    bool public isMigrationStart;

    uint256 public migrateIndex;
    mapping(uint256 => MigratorInfo) public migration;  //index->times   
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(uint256 => bool)) public isAirdrop;

    struct MigratorInfo {
        uint256 migrateIndex;
        address migrator;
        address to;
        uint256 migrateBalance;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    constructor(address _npxsxemToken, IERC20 _purseToken) {
        isOwner[msg.sender] = true;
        owner = msg.sender;
        npxsxemToken = _npxsxemToken;
        purseToken = _purseToken;
    }

    function migrateNPXSXEM(address _to, uint256 _amount) public {    
        require (isMigrationStart == true);
        uint256 remainingAmount = purseToken.balanceOf(address(this)); 
        require(block.timestamp <= endMigration, "Migration window over");
        require(_amount > 0);
        require(remainingAmount >=_amount);

        uint256 transferAmount = (_amount * 12) / 100;
        IERC20(npxsxemToken).transferFrom(msg.sender, address(this), _amount);

        migration[migrateIndex] = MigratorInfo(migrateIndex, msg.sender, _to, _amount);
        for (uint256 i = 0; i < 11; i++) {
            isAirdrop[migrateIndex][i] = false;
        }
        purseToken.transfer(_to, transferAmount);

        emit Migrate(migrateIndex, msg.sender, _to, _amount);
        migrateIndex += 1;
    }
    
    function startMigration(bool check, uint256 _startMigrate) public onlyOwner {
        if (check) {
            endMigration = _startMigrate + validDuration;
            isMigrationStart = true;
        } else {
            isMigrationStart = false;
        }
    }

    function updateEndMigration(uint256 _endMigration) public onlyOwner {
        endMigration = _endMigration;
    }

    function airDrop(uint256 start, uint256 end, uint256 airdropIndex) public onlyOwner {
        require(start < end && end <= migrateIndex );
        require(airdropIndex < 11 && airdropIndex >= 0) ;
        for (uint256 i = start; i < end; i++) {
            if (isAirdrop[i][airdropIndex] == false) {
                address recipient = migration[i].to;
                uint256 amount = migration[i].migrateBalance * 8 / 100;
                isAirdrop[i][airdropIndex] = true;
                purseToken.transfer(recipient, amount);                
            }
        }
    }
    
    function returnPurseToken(address _to) public onlyOwner {
        require(_to != address(0), "send to the zero address");
        uint256 remainingAmount = purseToken.balanceOf(address(this));
        purseToken.transfer(_to, remainingAmount);
    }
    
    function returnAnyToken(address token, uint256 amount, address _to) public onlyOwner {
        require(_to != address(0), "send to the zero address");
        IERC20(token).transfer(_to, amount);
    }

    function updateOwner(address _owner) public onlyOwner{
        require(_owner != address(0), "not valid address");
        require(_owner != owner, "same owner address");
        isOwner[_owner] = true;
        owner = _owner;
    } 
}
