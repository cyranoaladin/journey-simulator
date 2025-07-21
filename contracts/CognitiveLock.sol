pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CognitiveLock Staking Contract
/// @notice Simple ERC20 staking logic used for the MFAI journey simulator
contract CognitiveLock is Ownable {
    IERC20 public immutable token;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => StakeInfo) public stakes;

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    /// @notice Stake specified amount of tokens
    function stake(uint256 amount) external {
        require(amount > 0, "amount > 0");
        token.transferFrom(msg.sender, address(this), amount);
        StakeInfo storage info = stakes[msg.sender];
        info.amount += amount;
        info.timestamp = block.timestamp;
    }

    /// @notice Withdraw staked tokens
    function withdraw(uint256 amount) external {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "insufficient staked");
        info.amount -= amount;
        token.transfer(msg.sender, amount);
    }

    /// @notice View rewards available for user
    function claimable(address user) public view returns (uint256) {
        StakeInfo storage info = stakes[user];
        if (info.amount == 0) return 0;
        uint256 duration = block.timestamp - info.timestamp;
        return (info.amount * duration) / 1 days / 100; // 1% daily
    }

    /// @notice Claim staking rewards
    function claimRewards() external {
        uint256 reward = claimable(msg.sender);
        require(reward > 0, "no rewards");
        stakes[msg.sender].timestamp = block.timestamp;
        token.transfer(msg.sender, reward);
    }
}
