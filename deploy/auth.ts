import { assertEnvVars } from './util';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import { TransactionVersion } from '@stacks/transactions';

import { getNetwork } from './helper';

const [MNEMONIC,] = assertEnvVars('MNEMONIC');

export const getAccountWithAddress = async () => {
    const wallet = await generateWallet({
        secretKey: MNEMONIC,
        password: '',
    });
    const [account,] = wallet.accounts;
    const address = getStxAddress({ account, transactionVersion: (getNetwork() === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet) });

    return { account, address };
}
