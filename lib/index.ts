
export type NETWORK = "mainnet" | "testnet";

export const DEPLOYER: Record<NETWORK, string> = {
    mainnet: "SP282BC63F7JNK71YCF7HZHZZ2T9S9P3BN5ZAS3B6",
    testnet: "ST282BC63F7JNK71YCF7HZHZZ2T9S9P3BN5Z0WEM5"
}

// A list of all deployer addresses we used. Helps to determine transaction types with the frontend app.
export const DEPLOYERS = [
    "SP1Z5Z68R05X2WKSSPQ0QN0VYPB1902884KPDJVNF",
    "ST1Z5Z68R05X2WKSSPQ0QN0VYPB1902884H6197BB",
    "SP3TM2K3AZASRASP7BHKJ7HSVGTE5WRX1VTQ8VA8H",
    "ST3TM2K3AZASRASP7BHKJ7HSVGTE5WRX1VRX12WND",
    "SP34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C7DQNKAD",
    "ST34V5RC8C7E1F0GQS20JKV9PRYR10XZ9C67SRCB0",
    "SP282BC63F7JNK71YCF7HZHZZ2T9S9P3BN5ZAS3B6",
    "ST282BC63F7JNK71YCF7HZHZZ2T9S9P3BN5Z0WEM5"
]

export const MAGIC_BRIDGE: Record<NETWORK, string> = {
    mainnet: "",
    testnet: "ST2ZTY9KK9H0FA0NVN3K8BGVN6R7GYVFG6BE7TAR1.bridge"
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

