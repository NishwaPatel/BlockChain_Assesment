import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from "chai";

describe("TokenVesting", function () {
  let token;
  let vestingContract;
  let owner;
  let user;
  let partner;
  let team;
  const totalSupply = ethers.utils.parseEther("1000000");

  beforeEach(async function () {
    [owner, user, partner, team] = await ethers.getSigners();

    // Deploy the token contract
    const Token = await ethers.getContractFactory("ERC20Token");
    token = await Token.deploy("MyToken", "MTK");
    await token.deployed();

    // Deploy the vesting contract
    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    vestingContract = await TokenVesting.deploy(token.address);
    await vestingContract.deployed();

    // Allocate tokens to the vesting contract
    await token.transfer(vestingContract.address, totalSupply);
  });

  it("should create vesting schedules", async function () {
    // Add beneficiaries
    await vestingContract.addBeneficiary(user.address, ethers.utils.parseEther("500000"), "user");
    await vestingContract.addBeneficiary(partner.address, ethers.utils.parseEther("250000"), "partner");
    await vestingContract.addBeneficiary(team.address, ethers.utils.parseEther("250000"), "team");

    // Start vesting
    await vestingContract.startVesting();

    // Check vesting schedule for user
    const userSchedule = await vestingContract.vestingSchedules(user.address);
    expect(ethers.utils.formatEther(userSchedule.amount)).to.eq("500000.0");

    // Check vesting schedule for partner
    const partnerSchedule = await vestingContract.vestingSchedules(partner.address);
    expect(ethers.utils.formatEther(partnerSchedule.amount)).to.eq("250000.0");

    // Check vesting schedule for team
    const teamSchedule = await vestingContract.vestingSchedules(team.address);
    expect(ethers.utils.formatEther(teamSchedule.amount)).to.eq("250000.0");
  });

  it("should allow beneficiaries to claim tokens after cliff", async function () {
    // Add beneficiaries and start vesting
    await vestingContract.addBeneficiary(user.address, ethers.utils.parseEther("500000"), "user");
    await vestingContract.startVesting();
  
    // Fast forward time to just after the cliff period
    await ethers.provider.send("evm_increaseTime", [10 * 30 * 24 * 60 * 60]); // 10 months
    await ethers.provider.send("evm_mine");
  
    // User claims vested tokens
    await vestingContract.connect(user).claimTokens();
  
    // Check user balance
    const userBalance = await token.balanceOf(user.address);
    console.log("User balance after claiming tokens:", ethers.utils.formatEther(userBalance));
    expect(userBalance.gt(0)).to.be.true;
  });
  
  it("should correctly calculate vested tokens", async function () {
    // Add beneficiaries and start vesting
    await vestingContract.addBeneficiary(user.address, ethers.utils.parseEther("500000"), "user");
    await vestingContract.startVesting();
  
    // Fast forward time to half the vesting duration
    await ethers.provider.send("evm_increaseTime", [12 * 30 * 24 * 60 * 60]); // 12 months
    await ethers.provider.send("evm_mine");
  
    // User claims vested tokens
    await vestingContract.connect(user).claimTokens();
  
    // Check user balance
    const userBalance = await token.balanceOf(user.address);
    console.log("User balance after claiming tokens:", ethers.utils.formatEther(userBalance));
    const expectedBalance = ethers.utils.parseEther("250000"); // Half of the total allocation
    expect(userBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.0001"));
  });
});
