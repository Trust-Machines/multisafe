
export type NETWORK = "mainnet" | "testnet";

export const DEPLOYER: Record<NETWORK, string> = {
    mainnet: "SP34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C7DQNKAD",
    testnet: "ST34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C67SRCB0"
}

// A list of all deployer adresses we used. Helps to determine transaction types with the frontend app.
export const DEPLOYERS = [
    "SP1Z5Z68R05X2WKSSPQ0QN0VYPB1902884KPDJVNF",
    "ST1Z5Z68R05X2WKSSPQ0QN0VYPB1902884H6197BB",
    "SP3TM2K3AZASRASP7BHKJ7HSVGTE5WRX1VTQ8VA8H",
    "ST3TM2K3AZASRASP7BHKJ7HSVGTE5WRX1VRX12WND",
    "SP34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C7DQNKAD",
    "ST34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C67SRCB0"
]

export const MAGIC_BRIDGE: Record<NETWORK, string> = {
    mainnet: "",
    testnet: "ST2YG2RWHD3H38304MW0K06BQ2SEEWP38EFXY5CRV.bridge"
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
    if (threshold > owners.length) {
        throw new Error("Threshold cannot be higher than owner count");
    }
    const init = `(init (list\n '${owners.join("\n '")} \n) u${threshold}) `;
    return code.replace(/\(init \(list((.|\n)*)\)/, init);
}

export function makeSafeContract(code: string, owners: string[], threshold: number, network: NETWORK) {
    return makeInit(makeTraits(code, network), owners, threshold);
}

