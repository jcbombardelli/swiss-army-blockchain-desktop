import { ethers } from 'hardhat';
import { contract, COUNCIL_ADDRESS, TOKEN } from './consts';

(async function () {

  const [signer] = await ethers.getSigners() ;
  console.log(`🖊️  Using Hardhat signer: ${signer.address}`);

  const Council = await ethers.getContractFactory('Council');
  const council = Council.attach(COUNCIL_ADDRESS);

  const token = await contract(TOKEN);

  const data = token.interface.encodeFunctionData('mint', [signer.address, ethers.utils.parseUnits('1',"ether")])
  console.log(data)

  const tx = await council.prposeTransaction(token.address, data);
  console.log(tx.hash)


})()
