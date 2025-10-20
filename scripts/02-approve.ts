import { ethers } from 'hardhat';
import { COUNCIL_ADDRESS } from './consts';


(async function () {

  const [signer] = await ethers.getSigners() ;
  console.log(`🖊️  Using Hardhat signer: ${signer.address}`);

  const Council = await ethers.getContractFactory('Council');
  const council = Council.attach(COUNCIL_ADDRESS);

  const tx = await council.confirmTransaction(1);
  console.log(tx.hash)

  console.log(await council.transactions(1))
  console.log(await council.confirmationsRequired());


})()
