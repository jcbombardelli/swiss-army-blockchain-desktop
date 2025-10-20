import { ethers } from 'hardhat';
import { contract, COUNCIL_ADDRESS, TOKEN } from './consts';


(async function () {

  const [signer] = await ethers.getSigners() ;
  console.log(`🖊️  Using Hardhat signer: ${signer.address}`);

  const Council = await ethers.getContractFactory('Council');
  const council = Council.attach(COUNCIL_ADDRESS);

  const token = await contract(TOKEN);
  console.log(await council.transactions(1))
  console.log(`↗️ Balance Before Execute Council Transaction: ${ethers.utils.formatEther(await token.balanceOf(signer.address))}`)

  const tx = await council.executeTransaction(1, {gasLimit: 150000});
  console.log(tx.hash)
  await tx.wait();

  console.log(`✅ Balance After Execute Council Transaction: ${ethers.utils.formatEther(await token.balanceOf(signer.address))}`)



})()
