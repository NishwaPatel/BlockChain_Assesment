# BlockChain_Assesment
# Vesting Contract Project

This project contains a smart contract system for vesting tokens using Solidity, Hardhat, and Chai for testing. The system includes an ERC20 token and a vesting contract to manage the distribution and vesting schedules for different beneficiaries.

## Project Structure

- `contracts/`
  - `ERC20Token.sol`: Implementation of a basic ERC20 token using OpenZeppelin's ERC20 contract.
  - `TokenVesting.sol`: Implementation of the vesting contract to manage token distribution and vesting schedules.
- `test/`
  - `vestingContract.test.mjs`: Test file for testing the vesting contract functionality using Hardhat and Chai.
- `hardhat.config.js`: Configuration file for Hardhat.

## Sample Output

  TokenVesting
    ✔ should create vesting schedules (128ms)
User balance after claiming tokens: 111111.132544581618655692
    ✔ should allow beneficiaries to claim tokens after cliff (67ms)
User balance after claiming tokens: 166666.688100137174211248
    ✔ should correctly calculate vested tokens (78ms)

  3 passing (1s)


  ## Compile Contract

  npx hardhat complie

## Run the test

   npx hardhat test
