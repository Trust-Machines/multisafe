require('dotenv').config();

const fs = require('fs');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const { TransactionVersion } = require('@stacks/transactions');

const assertEnvVars = (vars) => {
    const _vars = typeof vars === 'object' ? [...vars] : [vars];
    const rv = [];
    for (let v of _vars) {
        if (!process.env[v]) {
            throw (`${v} env variable required!`);
        }

        rv.push(process.env[v]);
    }
    return rv;
}

const [NETWORK,] = assertEnvVars('NETWORK');

const getNetwork = () => {
    if (!['mainnet', 'testnet'].includes(NETWORK)) {
        throw new Error(`Invalid network: ${NETWORK}`);
    }

    return NETWORK;
}

const [MNEMONIC,] = assertEnvVars('MNEMONIC');

const getAccountWithAddress = async () => {
    const wallet = await generateWallet({
        secretKey: MNEMONIC,
        password: '',
    });
    const [account,] = wallet.accounts;
    const address = getStxAddress({ account, transactionVersion: (getNetwork() === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet) });

    return { account, address };
}


const DEPLOY_LIST = [
    {
        name: "multisafe-traits",
        file: "traits.clar"
    },
    {
        name: "ft-none",
        file: "helper/ft-none.clar"
    },
    {
        name: "nft-none",
        file: "helper/nft-none.clar"
    },
    {
        name: "add-owner",
        file: "executors/add-owner.clar"
    },
    {
        name: "remove-owner",
        file: "executors/remove-owner.clar"
    },
    {
        name: "set-threshold",
        file: "executors/set-threshold.clar"
    },
    {
        name: "transfer-stx",
        file: "executors/transfer-stx.clar"
    },
    {
        name: "transfer-sip-009",
        file: "executors/transfer-sip-009.clar"
    },
    {
        name: "transfer-sip-010",
        file: "executors/transfer-sip-010.clar"
    }
];


const main = async () => {
    const { account, address } = await getAccountWithAddress();

    console.log(`Account: ${address}`);
    console.log(`Network: ${getNetwork()}`);

    const TRAIT_SEARCH = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits';
    const TRAIT_REPLACE = `${address}.multisafe-traits`;


    if (fs.existsSync('generated')) {
        fs.rmSync('generated', { recursive: true, force: true });
    }

    const savePath = `generated/${NETWORK}`;
    fs.mkdirSync(savePath, { recursive: true });

    let i = 1;
    for (let D of DEPLOY_LIST) {
        const contents = fs.readFileSync(`contracts/${D.file}`, { encoding: 'utf-8' });
        const code = contents.replace(new RegExp(TRAIT_SEARCH, 'g'), TRAIT_REPLACE);
        const codeToSave = `${D.name}\n\n${code}`;
        fs.writeFileSync(`${savePath}/${i}-${D.name}`, codeToSave, { encoding: 'utf-8' });
        i++;
    }

    console.log("Done");
}

main().catch(console.log);