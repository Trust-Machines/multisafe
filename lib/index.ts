
export type NETWORK = "mainnet" | "testnet";

export const DEPLOYER: Record<NETWORK, string> = {
    mainnet: "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7",
    testnet: "ST3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBNNJCANK"
}

const TRAIT_BASE: Record<NETWORK, string> = {
    mainnet: `${DEPLOYER.mainnet}.multisafe-traits`,
    testnet: `${DEPLOYER.testnet}.multisafe-traits`
}

export const MAX_OWNERS = 20;

export function makeFtNone(network: NETWORK) {
    return `${DEPLOYER[network]}.ft-none`;
}

export function makeNFtNone(network: NETWORK) {
    return `${DEPLOYER[network]}.nft-none`;
}

function makeTraits(code: string, network: NETWORK) {
    return code.replace(/ .traits/g, ` '${TRAIT_BASE[network]}`);
}

function makeInit(code: string, owners: string[], threshold: number) {
    if (threshold > owners.length) {
        throw new Error("Threshold cannot be higher than owner count");
    }
    const init = `(init (list\n '${owners.join("\n '")} \n) u${threshold}) `;
    return code.replace(/\(init \(list((.|\n)*)\)/, init);
}

export function makeSafeContract(code: string, owners: string[], threshold: number, network: NETWORK) {
    return makeInit(makeTraits(code, network), owners, threshold);
}

