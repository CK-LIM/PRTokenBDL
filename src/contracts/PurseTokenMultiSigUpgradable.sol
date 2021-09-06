pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

abstract contract ERC20Interface {

    function transfer(address to, uint tokens) public virtual returns (bool success);

    function transferFrom(address from, address to, uint tokens) public virtual returns (bool success);

}

contract PurseTokenMultiSigUpgradable is Initializable, UUPSUpgradeable {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint8 public decimals;
    uint256 private minimumSupply;
    address public owner;
    address public liqPool;
    address public redPool;
    uint256 public mintIndex;
    uint256 public burnPercent;
    uint256 public liqPercent;
    uint256 public redPercent;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Burn(address indexed _from, address indexed _to, uint256 _value);
    event Mint(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isOwner;
    mapping(address => bool) public isWhitelistedTo;
    mapping(address => bool) public isWhitelistedFrom;

    function updateOwner(address _owner) public onlyOwner{
        require(_owner != address(0), "not valid address");
        require(_owner != owner, "same owner address");
        isOwner[_owner] = true;
        owner = _owner;
    } 

    function setWhitelistedTo(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0));
        require(!isWhitelistedTo[newWhitelist]);

        isWhitelistedTo[newWhitelist] = true;
    }

    function removeWhitelistedTo(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0));
        require(isWhitelistedTo[newWhitelist]);

        isWhitelistedTo[newWhitelist] = false;
    }

    function setWhitelistedFrom(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0));
        require(!isWhitelistedFrom[newWhitelist]);

        isWhitelistedFrom[newWhitelist] = true;
    }

    function removeWhitelistedFrom(address newWhitelist) external onlyOwner {
        require(newWhitelist != address(0));
        require(isWhitelistedFrom[newWhitelist]);

        isWhitelistedFrom[newWhitelist] = false;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(_value >= 0);
        require(balanceOf[msg.sender] >= _value);
        if (isWhitelistedTo[_to] || isWhitelistedFrom[msg.sender]) {
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
        require(_value >= 0);
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        if (isWhitelistedTo[_to] || isWhitelistedFrom[msg.sender]) {
            allowance[_from][msg.sender] -= _value;
            balanceOf[_from] -= _value;
            balanceOf[_to] += _value;
            emit Transfer(_from, _to, _value);
            return true;
        } else {
            allowance[_from][msg.sender] -= _value;
            uint256 transferValue = _partialBurn(_value, _from);
            balanceOf[_from] -= transferValue;
            balanceOf[_to] += transferValue;
            emit Transfer(_from, _to, transferValue);
            return true;
        }
    }

    function mint(address _account, uint256 _amount) public onlyOwner {
        require(_account != address(0));

        balanceOf[_account] += _amount;
        totalSupply += _amount;
        emit Mint(address(0), _account, _amount);
    }


    function burn(address _account, uint256 _amount) public onlyOwner {
        require(_account != address(0));
        uint256 accountBalance = balanceOf[_account];
        require(accountBalance >= _amount);
        balanceOf[_account] -= _amount;
        totalSupply -= _amount;
        emit Burn(_account, address(0), _amount);
    }

    function _partialBurn(uint256 _amount, address _from)
        internal
        returns (uint256)
    {
        uint256 transferAmount = 0;
        uint256 burnAmount;
        uint256 liqAmount;
        uint256 redAmount;
        (
            burnAmount,
            liqAmount,
            redAmount
        ) = _calculateDeductAmount(_amount);

        if (burnAmount >= 0 || liqAmount >= 0 || redAmount >= 0) {
            burnPrivate(_from, burnAmount, liqAmount, redAmount);
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
            uint256
        )
    {
        uint256 burnAmount;
        uint256 liqAmount;
        uint256 redAmount;

        if (totalSupply > minimumSupply) {
            burnAmount = (_amount * burnPercent) / 100;
            liqAmount = (_amount * liqPercent) / 100;
            redAmount = (_amount * redPercent) / 100;
            uint256 availableBurn = totalSupply - minimumSupply;
            if (burnAmount > availableBurn) {
                burnAmount = availableBurn;
            }
        }
        return (burnAmount, liqAmount, redAmount);
    }

    function burnPrivate(
        address _account,
        uint256 _burnAmount,
        uint256 _liqAmount,
        uint256 _redAmount
    ) private {
        require(_account != address(0));
        uint256 accountBalance = balanceOf[_account];
        uint256 deductAmount = _burnAmount + _liqAmount + _redAmount;
        require(accountBalance >= deductAmount);
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


    function updateLPoolAdd(address _newLPool) public onlyOwner {
        require(_newLPool != address(0));
        require(_newLPool != liqPool);

        liqPool = _newLPool;
    }

    function updateRPoolAdd(address _newRPool) public onlyOwner {
        require(_newRPool != address(0));
        require(_newRPool != redPool);

        redPool = _newRPool;
    }

    function updateBurnPercent(uint256 _newBurnPercent) public onlyOwner {
        require(_newBurnPercent >= 0 && _newBurnPercent <= 100);
        require(_newBurnPercent != burnPercent);

        burnPercent = _newBurnPercent;
    }

    function updateLiqPercent(uint256 _newLiqPercent) public onlyOwner {
        require(_newLiqPercent >= 0 && _newLiqPercent <= 100);
        require(_newLiqPercent != liqPercent);

        liqPercent = _newLiqPercent;
    }

    function updateRedPercent(uint256 _newRedPercent) public onlyOwner {
        require(_newRedPercent >= 0 && _newRedPercent <= 100);
        require(_newRedPercent != redPercent);

        redPercent = _newRedPercent;
    }
    
    function returnAnyToken(address token, uint256 amount, address _to) public onlyOwner{
        require(_to != address(0), "send to the zero address");
        ERC20Interface(token).transfer(_to, amount);
    } 

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function initialize(
        address _to,
        address _lPool,
        address _rPool,
        uint256 _burnPercent,
        uint256 _liqPercent,
        uint256 _redPercent
    ) public initializer {
        name = "PURSE Token";
        symbol = "PR";
        totalSupply = 64000000000 * (10**18); // 64 billion tokens
        decimals = 18;
        minimumSupply = 20000 * (10**18);

        require(_lPool != address(0));
        require(_rPool != address(0));
        require(_burnPercent >= 0);
        require(_liqPercent >= 0);
        require(_redPercent >= 0);

        liqPool = _lPool;
        redPool = _rPool;
        burnPercent = _burnPercent;
        liqPercent = _liqPercent;
        redPercent = _redPercent;
        isOwner[msg.sender] = true;
        owner = msg.sender;

        balanceOf[_to] = totalSupply;
        emit Mint(address(0), _to, totalSupply);
    }
}
