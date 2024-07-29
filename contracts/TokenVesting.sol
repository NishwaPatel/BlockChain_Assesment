// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenVesting {
    struct VestingSchedule {
        uint256 amount;
        uint256 claimed;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        string role;
        bool initialized;
    }

    mapping(address => VestingSchedule) public vestingSchedules;
    IERC20 public token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function addBeneficiary(address beneficiary, uint256 amount, string memory role) public {
        require(!vestingSchedules[beneficiary].initialized, "Vesting already initialized for this beneficiary");
        vestingSchedules[beneficiary] = VestingSchedule({
            amount: amount,
            claimed: 0,
            start: block.timestamp,
            cliff: 6 * 30 days, // Example cliff period of 6 months
            duration: 24 * 30 days, // Example vesting duration of 24 months
            role: role,
            initialized: true
        });
    }

    function startVesting() public {
        // Example function to start vesting (if needed)
    }

    function claimTokens() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.initialized, "Vesting not initialized");
        require(block.timestamp >= schedule.start + schedule.cliff, "Cliff period has not ended");

        uint256 vestedAmount = calculateVestedAmount(schedule);
        uint256 claimableAmount = vestedAmount - schedule.claimed;

        require(claimableAmount > 0, "No tokens to claim");

        schedule.claimed += claimableAmount;
        token.transfer(msg.sender, claimableAmount);
    }

    function calculateVestedAmount(VestingSchedule storage schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.start + schedule.cliff) {
            return 0;
        }
        if (block.timestamp >= schedule.start + schedule.duration) {
            return schedule.amount;
        }
        uint256 elapsedTime = block.timestamp - schedule.start - schedule.cliff;
        uint256 totalVestingTime = schedule.duration - schedule.cliff;
        uint256 vestedAmount = (schedule.amount * elapsedTime) / totalVestingTime;
        return vestedAmount;
    }
}
