
export type NETWORK = "mainnet" | "testnet";

export const MAINNET_DEPLOYER = "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7";
export const TESTNET_DEPLOYER = "ST3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBNNJCANK";

const TRAIT_BASE = {
    mainnet: `${MAINNET_DEPLOYER}.multisafe-traits`,
    testnet: `${TESTNET_DEPLOYER}.multisafe-traits`
};

export const MAX_OWNERS = 20;

function makeTraits(code: string, network: NETWORK) {
    return code.replace(/ .traits/g, ` '${TRAIT_BASE[network]}`);
}

function makeInit(code: string, owners: string[], threshold: number) {
    const init = `(init (list\n '${owners.join("\n '")} \n) u${threshold}) `;
    return code.replace(/\(init \(list((.|\n)*)\)/, init);
}

export function makeSafeContract(code: string, owners: string[], threshold: number, network: NETWORK) {
    return makeInit(makeTraits(code, network), owners, threshold);
}

