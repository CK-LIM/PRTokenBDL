pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PurseTokenMultiSigUpgradable is Initializable, UUPSUpgradeable {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint8 public decimals;
    uint8 public numConfirmationsRequired;
    uint256 private minimumSupply;
    address[] public owners;
    address public liqPool;
    address public redPool;
    uint256 public mintIndex;
    uint256 public deductPercent;
    uint256 public burnPercent;
    uint256 public liqPercent;
    uint256 public redPercent;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Burn(address indexed _from, address indexed _to, uint256 _value);
    event Mint(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event SubmitMint(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value);
    event ConfirmMint(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmMint(address indexed owner, uint256 indexed txIndex);
    event ExecuteMint(address indexed owner, uint256 indexed txIndex);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier mintExists(uint256 _mintIndex) {
        require(mintExist[_mintIndex], "mint does not exist");
        _;
    }

    modifier mintNotExecuted(uint256 _txIndex) {
        require(!mints[_txIndex].executed, "tx already executed");
        _;
    }

    modifier mintNotConfirmed(uint256 _txIndex) {
        require(!mintIsConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isOwner;
    // mapping for Mint from mint index => owner => bool
    mapping(uint256 => mapping(address => bool)) public mintIsConfirmed;
    mapping(uint256 => bool) public mintExist;
    mapping(uint256 => MintInfo) public mints;
    mapping(address => bool) public isWhitelisted;

    struct MintInfo {
        address to;
        uint256 value;
        bool executed;
        uint256 numConfirmations;
    }

    function addOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "invalid owner");
        require(!isOwner[newOwner], "owner not unique");

        isOwner[newOwner] = true;
        owners.push(newOwner);
    }

    function setWhitelisted(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0), "invalid whitelist");
        require(!isWhitelisted[newWhitelist], "whitelist not unique");

        isWhitelisted[newWhitelist] = true;
    }

    function removeWhitelisted(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0), "invalid whitelist");
        require(isWhitelisted[newWhitelist], "whitelist not unique");

        isWhitelisted[newWhitelist] = false;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);
        if (isWhitelisted[_to]) {
            balanceOf[msg.sender] -= _value;
            balanceOf[_to] += _value;

            emit Transfer(msg.sender, _to, _value);
            return true;
        } else {
            uint256 transferValue = _partialBurn(_value, msg.sender);
            balanceOf[msg.sender] -= transferValue;
            balanceOf[_to] += transferValue;

            emit Transfer(msg.sender, _to, transferValue);
            return true;
        }
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {

        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        if (isWhitelisted[_to]) {
            allowance[_from][msg.sender] -= _value;
            balanceOf[_from] -= _value;
            balanceOf[_to] += _value;
            emit Transfer(_from, _to, _value);
            return true;
        }else {
            allowance[_from][msg.sender] -= _value;
            uint256 transferValue = _partialBurn(_value, _from);
            balanceOf[_from] -= transferValue;
            balanceOf[_to] += transferValue;
            emit Transfer(_from, _to, transferValue);
            return true;
        }
    }

    function mint(address _account, uint256 _amount) internal onlyOwner {
        require(_account != address(0), "ERC20: mint to the zero address");

        balanceOf[_account] += _amount;
        totalSupply += _amount;
        emit Mint(address(0), _account, _amount);
    }

    function submitMint(address _to, uint256 _value) public onlyOwner {
        mints[mintIndex] = MintInfo(_to, _value, false, 0);
        mintExist[mintIndex] = true;
        emit SubmitMint(msg.sender, mintIndex, _to, _value);
        mintIndex += 1;
    }

    function confirmMint(uint256 _mintIndex)
        public
        onlyOwner
        mintExists(_mintIndex)
        mintNotExecuted(_mintIndex)
        mintNotConfirmed(_mintIndex)
    {
        mints[_mintIndex].numConfirmations += 1;
        mintIsConfirmed[_mintIndex][msg.sender] = true;

        emit ConfirmMint(msg.sender, _mintIndex);
    }

    function executeMint(uint256 _mintIndex)
        public
        onlyOwner
        mintExists(_mintIndex)
        mintNotExecuted(_mintIndex)
    {
        require(
            mints[_mintIndex].numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );
        mints[_mintIndex].executed = true;
        mint(mints[_mintIndex].to, mints[_mintIndex].value);

        emit ExecuteMint(msg.sender, _mintIndex);
    }

    function revokeMintConfirmation(uint256 _mintIndex)
        public
        onlyOwner
        mintExists(_mintIndex)
        mintNotExecuted(_mintIndex)
    {
        require(mintIsConfirmed[_mintIndex][msg.sender], "tx not confirmed");

        mints[_mintIndex].numConfirmations -= 1;
        mintIsConfirmed[_mintIndex][msg.sender] = false;

        emit RevokeConfirmMint(msg.sender, _mintIndex);
    }

    function burn(address _account, uint256 _amount) public onlyOwner {
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balanceOf[_account];
        require(
            accountBalance >= _amount,
            "ERC20: burn amount exceeds balance"
        );
        balanceOf[_account] -= _amount;
        totalSupply -= _amount;
        emit Burn(_account, address(0), _amount);
    }

    function _partialBurn(uint256 _amount, address _from)
        internal
        returns (uint256)
    {
        uint256 transferAmount = 0;
        uint256 deductAmount;
        uint256 burnAmount;
        uint256 liqAmount;
        uint256 redAmount;
        (
            deductAmount,
            burnAmount,
            liqAmount,
            redAmount
        ) = _calculateDeductAmount(_amount);

        if (deductAmount > 0) {
            burnPrivate(_from, deductAmount, burnAmount, liqAmount, redAmount);
        }
        transferAmount = _amount - burnAmount - liqAmount - redAmount;

        return transferAmount;
    }

    function _calculateDeductAmount(uint256 _amount)
        internal
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 deductAmount;
        uint256 burnAmount;
        uint256 liqAmount;
        uint256 redAmount;
        // burn amount calculations
        if (totalSupply > minimumSupply) {
            deductAmount = (_amount * deductPercent) / 100;
            burnAmount = (_amount * burnPercent) / 100;
            liqAmount = (_amount * liqPercent) / 100;
            redAmount = (_amount * redPercent) / 100;
            uint256 availableBurn = totalSupply - minimumSupply;
            if (burnAmount > availableBurn) {
                burnAmount = availableBurn;
            }
        }
        return (deductAmount, burnAmount, liqAmount, redAmount);
    }

    function burnPrivate(
        address _account,
        uint256 _deductAmount,
        uint256 _burnAmount,
        uint256 _liqAmount,
        uint256 _redAmount
    ) private {
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balanceOf[_account];
        require(
            accountBalance >= _deductAmount,
            "ERC20: deduct amount exceeds balance"
        );
        balanceOf[_account] -= _burnAmount;
        balanceOf[_account] -= _liqAmount;
        balanceOf[_account] -= _redAmount;

        totalSupply -= _burnAmount;
        balanceOf[liqPool] += _liqAmount;
        balanceOf[redPool] += _redAmount;
        emit Burn(_account, address(0), _burnAmount);
        emit Transfer(msg.sender, liqPool, _liqAmount);
        emit Transfer(msg.sender, redPool, _redAmount);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function updateLPoolAdd(address _newLPool) public onlyOwner {
        require(_newLPool != address(0), "invalid owner");
        require(_newLPool != liqPool, "owner not unique");

        liqPool = _newLPool;
    }

    function updateRPoolAdd(address _newRPool) public onlyOwner {
        require(_newRPool != address(0), "invalid owner");
        require(_newRPool != redPool, "owner not unique");

        redPool = _newRPool;
    }

    function updateDeductPercent(uint256 _newDeductPercent) public onlyOwner {
        require(_newDeductPercent >= 0, "smalller than zero");
        require(_newDeductPercent != deductPercent, "percentage not unique");

        deductPercent = _newDeductPercent;
    }

    function updateBurnPercent(uint256 _newBurnPercent) public onlyOwner {
        require(_newBurnPercent >= 0, "smalller than zero");
        require(_newBurnPercent != burnPercent, "percentage not unique");

        burnPercent = _newBurnPercent;
    }

    function updateLiqPercent(uint256 _newLiqPercent) public onlyOwner {
        require(_newLiqPercent >= 0, "smalller than zero");
        require(_newLiqPercent != liqPercent, "percentage not unique");

        liqPercent = _newLiqPercent;
    }

    function updateRedPercent(uint256 _newRedPercent) public onlyOwner {
        require(_newRedPercent >= 0, "smalller than zero");
        require(_newRedPercent != redPercent, "percentage not unique");

        redPercent = _newRedPercent;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function initialize(
        address _to,
        address[] memory _owners,
        uint8 _numConfirmationsRequired,
        address _lPool,
        address _rPool,
        uint256 _deductPercent,
        uint256 _burnPercent,
        uint256 _liqPercent,
        uint256 _redPercent
    ) public initializer {
        name = "PURSE";
        symbol = "PR";
        totalSupply = 64000000000 * (10**18); // 64 billion tokens
        decimals = 18;
        minimumSupply = 20000 * (10**18);

        require(_owners.length > 0, "owners required");
        require(_lPool != address(0), "invalid liqPool address");
        require(_rPool != address(0), "invalid redPool address");
        require(_deductPercent >= 0, "deduct percentage less than 0");
        require(_burnPercent >= 0, "burn percentage less than 0");
        require(_liqPercent >= 0, "liq percentage less than 0");
        require(_redPercent >= 0, "red percentage less than 0");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
        
        numConfirmationsRequired = _numConfirmationsRequired;
        liqPool = _lPool;
        redPool = _rPool;
        deductPercent = _deductPercent;
        burnPercent = _burnPercent;
        liqPercent = _liqPercent;
        redPercent = _redPercent;

        balanceOf[_to] = totalSupply;
        emit Mint(address(0), _to, totalSupply);
    }
}
