
export type NETWORK = "mainnet" | "testnet";

export const NULL_ADDRESS: Record<NETWORK, string>  = {
    mainnet: "SP000000000000000000002Q6VF78",
    testnet: "ST000000000000000000002AMW42H"
}

export const DEPLOYER: Record<NETWORK, string>  = {
    mainnet: "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7",
    testnet: "ST3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBNNJCANK"
}

const TRAIT_BASE: Record<NETWORK, string> = {
    mainnet: `${DEPLOYER.mainnet}.multisafe-traits`,
    testnet: `${DEPLOYER.testnet}.multisafe-traits`
}

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

