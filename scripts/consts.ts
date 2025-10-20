import contracts from '../../contracts.json'
import { ContractEnvironment } from '../../src/types/contracts.type';
import { ethers } from 'hardhat';


const env = process.env.ENV || 'local';

export const COUNCIL_ADDRESS = '0x22B5f5fB8F4058Db5303FB85eFfbdb2FDD1D4f3b';
export const TOKEN = 'MTST';


export const contract = async (_TOKEN: string) => {
  const { tokens } = contracts[env] as ContractEnvironment;
  const tokendata = tokens.find(token => token.symbol === _TOKEN)

  if (!tokendata)
    throw new Error(`🤡 Token not found! If you are on the correct network ${env}. It will be necessary to map it in "contracts.json" or deploy a new proxy `);
  const TokenLogic = await ethers.getContractFactory('BEE4ERC20UpgradeableV1');
  return TokenLogic.attach(tokendata.address);
}
