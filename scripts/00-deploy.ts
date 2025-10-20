import { ethers } from 'hardhat';
import { kDeploy, txExec } from '../../../lib/txPipeline';
import * as t from '../../../lib/typechain-types';


(async function (){

    const [signer] = await ethers.getSigners() ;

    const Council = await ethers.getContractFactory('Council', signer);
    const council = await kDeploy(Council.deploy([signer.address])) as t.Council;

    console.log(council.address)

})()
