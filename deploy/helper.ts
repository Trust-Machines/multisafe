
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { assertEnvVars } from './util';


const NETWORKS = {
    'mainnet': new StacksMainnet(),
    'testnet': new StacksTestnet()
}

export const getStacksNetwork = () => {
    return NETWORKS[getNetwork()];
}

export const getNetwork = () => {
    const [NETWORK,] = assertEnvVars('NETWORK');

    if (!['mainnet', 'testnet'].includes(NETWORK)) {
        throw new Error(`Invalid network: ${NETWORK}`);
    }

    return NETWORK;
}