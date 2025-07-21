import { ethers } from "hardhat";

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS || ethers.constants.AddressZero;
  const CognitiveLock = await ethers.getContractFactory("CognitiveLock");
  const lock = await CognitiveLock.deploy(tokenAddress);
  await lock.deployed();
  console.log("CognitiveLock deployed to:", lock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
