pragma solidity ^0.8.0;


contract PurseToken {
    string  public name = "PURSE";
    string  public symbol = "PR";
    uint256 public totalSupply = 64000000000000000000000000000; // 100 million tokens
    uint8   public decimals = 18;
    uint256 private minimumSupply = 20000 * (10 ** 18);
    address public owner;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Burn(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Mint(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping (address => bool) public admin;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function updateAdmin(address newAdmin) external {
        require(msg.sender == owner, 'only owner');
        admin[newAdmin] = true;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        uint256 partialBurnValue = _partialBurn(_value, msg.sender);
        balanceOf[msg.sender] -= partialBurnValue;
        balanceOf[_to] += partialBurnValue;

        emit Transfer(msg.sender, _to, partialBurnValue);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        uint256 partialBurnValue = _partialBurn(_value, _from);
        balanceOf[_from] -= partialBurnValue;
        balanceOf[_to] += partialBurnValue;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, partialBurnValue);
        return true;
    }

    function mint(address _account, uint256 _amount) public {
        require(msg.sender == owner || admin[msg.sender] == true , "not owner neither admin");
        require(_account != address(0), "ERC20: mint to the zero address");

        balanceOf[_account] += _amount;
        totalSupply += _amount;
        emit Mint(address(0), _account, _amount);

    }

    function burn(address _account, uint256 _amount) public {
        require(msg.sender == owner, "not owner");
        require(msg.sender == owner || admin[msg.sender] == true , "not owner neither admin");
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balanceOf[_account];
        require(accountBalance >= _amount, "ERC20: burn amount exceeds balance");
        balanceOf[_account] -= _amount;
        totalSupply -= _amount;
        emit Burn(_account, address(0), _amount);
    }

    function burnPrivate(address _account, uint256 _amount) private {
 //       require(msg.sender == owner, "not owner");
        require(_account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balanceOf[_account];
        require(accountBalance >= _amount, "ERC20: burn amount exceeds balance");

        balanceOf[_account] -= _amount;
        totalSupply -= _amount;
        emit Burn(_account, address(0), _amount);
    }

    function _partialBurn(uint256 _amount, address _from) internal returns (uint256) {
        uint256 transferAmount = 0;
        uint256 burnAmount = _calculateBurnAmount(_amount);

        if (burnAmount > 0) {
            burnPrivate(_from, burnAmount);
        }
        transferAmount = _amount - burnAmount;

        return transferAmount;
    }

    function _calculateBurnAmount(uint256 _amount) internal view returns (uint256) {
        uint256 burnAmount = 0;

        // burn amount calculations
        if (totalSupply > minimumSupply) {
            burnAmount = _amount/2;
            uint256 availableBurn = totalSupply - minimumSupply;
            if (burnAmount > availableBurn) {
                burnAmount = availableBurn;
            }
        }
        return burnAmount;
    }
}