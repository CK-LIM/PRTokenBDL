// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./PurseTokenMultiSigUpgradable.sol";

contract NPXSXEMigrationMulSig {
    event SubmitTransaction(address indexed owner, uint indexed txIndex, address indexed to, uint value);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);
    
    string public name = "NPXSXEM Migration";
    PurseTokenMultiSigUpgradable public purseToken;
    uint256 internal tokenBurnRate = 2;
    uint public numConfirmationsRequired;
    uint public transactionIndex;
    address[] public owners;
    address[] public admins;
    mapping(address => bool) public isOwner;
    mapping(address => bool) public isAdmin;
    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;
    mapping(uint => bool) public txExist;
    mapping(uint => Transaction) public transactions;

    struct Transaction {
        address to;
        uint value;
        bool executed;
        uint numConfirmations;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "not admin");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(txExist[_txIndex], "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    constructor(PurseTokenMultiSigUpgradable _purseToken, address[] memory _owners, address[] memory _admins, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(_admins.length > 0, "admins required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
        for (uint i = 0; i < _admins.length; i++) {
            address admin = _admins[i];

            require(admin != address(0), "invalid admin");
            require(!isAdmin[admin], "admin not unique");

            isAdmin[admin] = true;
            admins.push(admin);
        }
        purseToken = _purseToken;
        numConfirmationsRequired = _numConfirmationsRequired;
    }

    function submitTransaction(address _to, uint _value) public onlyAdmin {
        
        transactions[transactionIndex] = Transaction( _to,  _value, false, 0 );
        txExist[transactionIndex] = true;
        emit SubmitTransaction(msg.sender, transactionIndex, _to, _value);
        transactionIndex +=1;
    }

    function confirmTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {

        transactions[_txIndex].numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {

        require(transactions[_txIndex].numConfirmations >= numConfirmationsRequired, "cannot execute tx");
        transactions[_txIndex].executed = true;
        uint256 transferAmount = transactions[_txIndex].value * tokenBurnRate;
        purseToken.transfer(transactions[_txIndex].to, transferAmount);

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {

        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        transactions[_txIndex].numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getAdmins() public view returns (address[] memory) {
        return admins;
    }

    function getTransactionCount() public view returns (uint) {
        return transactionIndex;
    }

    function getTransaction(uint _txIndex) public view returns (address to, uint value, bool executed, uint numConfirmations ) {
        return (
            transactions[_txIndex].to,
            transactions[_txIndex].value,
            transactions[_txIndex].executed,
            transactions[_txIndex].numConfirmations
        );
    }

    function addAdmins(address _admin) public onlyOwner{
        require(_admin != address(0), "invalid admin");
        require(!isAdmin[_admin], "admin not unique");
        
        isAdmin[_admin] = true;
        admins.push(_admin);
    }

    function removeAdmins(uint index) public onlyOwner returns (address[] memory){
        address removeAdmin = admins[index];
        require(index < admins.length, "invalid index");
        require(removeAdmin != address(0), "invalid admin");
        require(isAdmin[removeAdmin], "not admin");

        for (uint i = index; i<admins.length-1; i++){
            admins[i] = admins[i+1];
        }
        

        admins.pop();
        isAdmin[removeAdmin] = false;

        return admins;
    }

    function addOwners(address _owner) public onlyOwner{
        require(_owner != address(0), "invalid owner");
        require(!isOwner[_owner], "owner not unique");
        
        isOwner[_owner] = true;
        owners.push(_owner);
    }

    function removeOwners(uint index) public onlyOwner returns (address[] memory){
        address removeOwner = owners[index];
        require(index < owners.length, "invalid index");
        require(removeOwner != address(0), "invalid owner");
        require(isOwner[removeOwner], "not owner");
        
        for (uint i = index; i<owners.length-1; i++){
            owners[i] = owners[i+1];
        }
        owners.pop();

        isOwner[removeOwner] = false;
        return owners;
    }
}
