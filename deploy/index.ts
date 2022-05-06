import { getAccountWithAddress } from './auth';
import { assertEnvVars } from './util';

const [NETWORK,] = assertEnvVars('NETWORK');


const deployTraits = async () => {

}

const deployExecutors = async () => {

}


const deployHelpers = async () => {

}


const main = async () => {
    const { address } = await getAccountWithAddress();
    console.log(address);
}

main().catch(console.log);