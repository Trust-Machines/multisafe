import { Clarinet, Tx, Chain, Account, types, green } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts';

const FT_NONE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ft-none");
const NFT_NONE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-none");

const SAFE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe");
const ADD_OWNER_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner");
const REMOVE_OWNER_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner");
const THRESHOLD_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-threshold");
const TRANSFER_STX_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx");
const MAGIC_BRIDGE_SET_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.magic-bridge-set");
const MAGIC_BRIDGE = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.magic-bridge";

/* Test helpers */

const submit = (CHAIN: Chain, executor: any, paramP: string | null, paramU: number | null, txSender: string) => {
    return CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "submit",
            [
                executor,
                SAFE,
                FT_NONE,
                NFT_NONE,
                paramP ? types.some(types.principal(paramP)) : types.none(),
                paramU ? types.some(types.uint(paramU)) : types.none(),
                types.none()
            ],
            txSender
        ),
    ]).receipts[0].result;
}

const addOwner = (CHAIN: Chain, newOwner: string, txSender: string) => {
    return submit(CHAIN, ADD_OWNER_EXECUTOR, newOwner, null, txSender);
}

const setThreshold = (CHAIN: Chain, threshold: number, txSender: string) => {
    return submit(CHAIN, THRESHOLD_EXECUTOR, null, threshold, txSender);
}

const removeOwner = (CHAIN: Chain, owner: string, txSender: string) => {
    return submit(CHAIN, REMOVE_OWNER_EXECUTOR, owner, null, txSender);
}

const transferStx = (CHAIN: Chain, recipient: string, amount: number, txSender: string) => {
    return submit(CHAIN, TRANSFER_STX_EXECUTOR, recipient, amount, txSender);
}

const confirm = (CHAIN: Chain, txId: number, executor: any, txSender: string) => {
    return CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "confirm",
            [
                types.uint(txId),
                executor,
                SAFE,
                FT_NONE,
                NFT_NONE,
            ],
            txSender
        ),
    ]).receipts[0].result;
}

const revoke = (CHAIN: Chain, txId: number, txSender: string) => {
    return CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "revoke",
            [types.uint(txId)],
            txSender
        ),
    ]).receipts[0].result;
}

const getOwners = (CHAIN: Chain, txSender: string) => {
    let block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-owners",
            [],
            txSender
        ),
    ]);

    return block.receipts[0].result.expectList();
}

const getNonce = (CHAIN: Chain, txSender: string) => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-nonce",
            [],
            txSender
        ),
    ]);

    return block.receipts[0].result;
}

const getThreshold = (CHAIN: Chain, txSender: string) => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-threshold",
            [],
            txSender
        ),
    ]);
    return block.receipts[0].result;
}

const getTransaction = (CHAIN: Chain, txId: number, txSender: string) => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-transaction",
            [types.uint(txId)],
            txSender
        ),
    ]);

    return block.receipts[0].result.expectTuple()
}


/* Test definitions */

type TestFn = (
    CHAIN: Chain,
    WALLETS: string[],
    DEPLOYER?: string,
) => void

const TESTS: Record<string, TestFn> = {
    "testSetup": (CHAIN: Chain, WALLETS: string[]) => {
        // send some stx to the safe contract
        CHAIN.mineBlock([
            Tx.transferSTX(
                50000000,
                "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe",
                "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
            ),
        ]);

        const assetMap = CHAIN.getAssetsMaps();
        assertEquals(assetMap["assets"]["STX"]["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"], 50000000);
    },
    "testSafeOnly": (CHAIN: Chain, WALLETS: string[]) => {
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "add-owner",
                [types.principal(WALLETS[3])],
                WALLETS[0]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u100");

        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "remove-owner",
                [types.principal(WALLETS[2])],
                WALLETS[1]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u100");

        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "set-threshold",
                [types.uint(1)],
                WALLETS[2]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u100");
    },
    "testOnlyOwner": (CHAIN: Chain, WALLETS: string[]) => {
        let resp = addOwner(CHAIN, "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND", WALLETS[3]);
        assertEquals(resp.expectErr(), "u130");

        resp = confirm(CHAIN, 0, ADD_OWNER_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u130");
    },
    "testAddNewOwner": (CHAIN: Chain, WALLETS: string[]) => {
        // Check current owners. Should be 3.
        let owners = getOwners(CHAIN, WALLETS[0]);
        assertEquals(owners.length, 3);
        assertEquals(owners[0], WALLETS[0]);
        assertEquals(owners[1], WALLETS[1]);
        assertEquals(owners[2], WALLETS[2]);

        // Start a new transaction to add a new owner.
        let resp = addOwner(CHAIN, WALLETS[3], WALLETS[0]);
        assertEquals(resp.expectOk(), "u0");

        // The new transaction should be available in the transacions mapping.
        let tx: any = getTransaction(CHAIN, 0, WALLETS[0]);
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.id, "u0");
        assertEquals(tx.confirmed, "false");
        assertEquals(confirmations.length, 1);
        assertEquals(confirmations[0], WALLETS[0]);

        // The user already confirmed transaction by submitting it. Should revert.
        resp = confirm(CHAIN, 0, ADD_OWNER_EXECUTOR, WALLETS[0]);
        assertEquals(resp.expectErr(), "u150");

        // Executor should be passed properly. Should revert.
        resp = confirm(CHAIN, 0, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectErr(), "u160");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 0, ADD_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "true");

        // The transaction already confirmed. Should revert
        resp = confirm(CHAIN, 0, ADD_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectErr(), "u180");

        // The transaction confirmed by sufficient number of owners.
        tx = getTransaction(CHAIN, 0, WALLETS[0]);
        confirmations = tx.confirmations.expectList();

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 2);
        assertEquals(confirmations[0], WALLETS[0]);
        assertEquals(confirmations[1], WALLETS[1]);

        // New owner should be added. should be 4.
        owners = getOwners(CHAIN, WALLETS[0]);
        assertEquals(owners.length, 4);
        assertEquals(owners[3], WALLETS[3]);

        // Nonce should be incremented.
        const nonce = getNonce(CHAIN, WALLETS[0]);
        assertEquals(nonce, "u1");
    },
    "testSetThreshold": (CHAIN: Chain, WALLETS: string[]) => {
        // Check current value. should be 2.
        let threshold = getThreshold(CHAIN, WALLETS[0]);
        assertEquals(threshold, "u2");

        // Start a transaction to update minimum confirmation requirement.
        let resp = setThreshold(CHAIN, 3, WALLETS[0]);
        assertEquals(resp.expectOk(), "u1");

        // // Owner 2 confirms. Confirmed.
        resp = confirm(CHAIN, 1, THRESHOLD_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "true");

        // Minimum confirmation requirement should be updated as 3.
        threshold = getThreshold(CHAIN, WALLETS[0]);
        assertEquals(threshold, "u3");
    },
    "testRemoveOwner": (CHAIN: Chain, WALLETS: string[]) => {
        // Start a new transaction to remove an owner.
        let resp = removeOwner(CHAIN, WALLETS[0], WALLETS[3]);
        assertEquals(resp.expectOk(), "u2");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 2, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms.
        resp = confirm(CHAIN, 2, REMOVE_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectOk(), "true");

        // Confirmed.
        let tx: any = getTransaction(CHAIN, 2, WALLETS[0]);
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 3);
        assertEquals(confirmations[0], WALLETS[3]);
        assertEquals(confirmations[1], WALLETS[1]);
        assertEquals(confirmations[2], WALLETS[2]);

        // Owner should be removed. Now we should have 3 owners.
        let owners = getOwners(CHAIN, WALLETS[0]);
        assertEquals(owners.length, 3);
    },
    "testSpendStx": (CHAIN: Chain, WALLETS: string[]) => {
        // Start a new transaction to send STX from the safe to another account
        let resp = transferStx(CHAIN, "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", 50000000, WALLETS[1]);
        assertEquals(resp.expectOk(), "u3");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 3, TRANSFER_STX_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms.
        resp = confirm(CHAIN, 3, TRANSFER_STX_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectOk(), "true");

        // Confirmed. STX balance of the safe should be 0.
        const assetMap = CHAIN.getAssetsMaps();
        assertEquals(assetMap["assets"]["STX"]["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"], 0);
    },
    "testVaultOwnershipExample": (CHAIN: Chain, WALLETS: string[], DEPLOYER?: string) => {
        // We have an imaginary vault contract and owner of the contract is the safe contract
        // We want to update `token-per-cycle` by calling an owner only function `set-token-per-cycle`

        // Default token per cycle is u100
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "vault",
                "get-token-per-cycle",
                [],
                DEPLOYER!
            ),
        ]);
        assertEquals(block.receipts[0].result, "u100");

        // The vault contract can't be updated directly by a user because it is owned by the safe contract
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "vault",
                "set-token-per-cycle",
                [types.uint(500)],
                DEPLOYER!
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u900");

        // Start transaction to update `token-per-cycle`
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-vault-token-per-cycle"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    FT_NONE,
                    NFT_NONE,
                    types.some(types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")),
                    types.some(types.uint(1200)),
                    types.none()
                ],
                WALLETS[1]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u4");

        // Owner 2 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(4),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-vault-token-per-cycle"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    FT_NONE,
                    NFT_NONE,
                ],
                WALLETS[2]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "false");

        //  Owner 3 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(4),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-vault-token-per-cycle"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    FT_NONE,
                    NFT_NONE,
                ],
                WALLETS[3]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "true");

        // `token-per-cycle` should be updated
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "vault",
                "get-token-per-cycle",
                [],
                DEPLOYER!
            ),
        ]);
        assertEquals(block.receipts[0].result, "u1200");
    },
    "testListTransactionsByIds": (CHAIN: Chain, WALLETS: string[]) => {
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-transactions",
                [types.list([types.uint(0), types.uint(1), types.uint(2), types.uint(3), types.uint(4)])],
                WALLETS[0]
            ),
        ]);

        assertEquals(block.receipts[0].result.expectList().length, 5);
    },
    "testGetVersion": (CHAIN: Chain, WALLETS: string[]) => {
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-version",
                [],
                WALLETS[0]
            ),
        ]);

        assertEquals(block.receipts[0].result, '"0.0.4.alpha"');
    },
    "testGetInfo": (CHAIN: Chain, WALLETS: string[]) => {
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-info",
                [],
                WALLETS[0]
            ),
        ]);

        const json = JSON.parse(JSON.stringify(block.receipts[0].result.expectTuple()));
        assertEquals(json.version !== undefined, true);
        assertEquals(json.owners !== undefined, true);
        assertEquals(json["threshold"] !== undefined, true);
        assertEquals(json.nonce !== undefined, true);
        assertEquals(json["mb-address"] !== undefined, true);
    },
    "testRevoke": (CHAIN: Chain, WALLETS: string[]) => {
        // Tx not exists.
        let resp = revoke(CHAIN, 10, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u140');

        // Tx already confirmed.
        resp = revoke(CHAIN, 4, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u180');

        // Start a new tx.
        resp = transferStx(CHAIN, "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", 50000000, WALLETS[1]);
        assertEquals(resp.expectOk(), "u5");

        // Should reject becuase the owner hasn't confirmed the tx.
        resp = revoke(CHAIN, 5, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u190');

        // Should revoke.
        resp = revoke(CHAIN, 5, WALLETS[1]);
        assertEquals(resp.expectOk(), 'true');

        // Confirmation should be removed.
        const tx = getTransaction(CHAIN, 5, WALLETS[0]);
        assertEquals(JSON.parse(JSON.stringify(tx)).confirmations, '[]');
    },
    "testSetThresholdOverflowProtection": (CHAIN: Chain, WALLETS: string[]) => {
        // Start a transaction to set threshold.
        let resp = setThreshold(CHAIN, 21, WALLETS[1]);
        assertEquals(resp.expectOk(), "u6");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 6, THRESHOLD_EXECUTOR, WALLETS[2]);

        // Owner 3 confirms but reverted.
        resp = confirm(CHAIN, 6, THRESHOLD_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u220");
    },
    "testSetThresholdOwnerCountProtection": (CHAIN: Chain, WALLETS: string[]) => {
        // Start a transaction to set threshold.
        let resp = setThreshold(CHAIN, 4, WALLETS[1]);
        assertEquals(resp.expectOk(), "u7");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 7, THRESHOLD_EXECUTOR, WALLETS[2]);

        // Owner 3 confirms but reverted.
        resp = confirm(CHAIN, 7, THRESHOLD_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u230");
    },
    "testRemoveOwnerThresholdProtection": (CHAIN: Chain, WALLETS: string[]) => {
        // Start a new transaction to remove an owner.
        let resp = removeOwner(CHAIN, WALLETS[3], WALLETS[3]);
        assertEquals(resp.expectOk(), "u8");

        // Owner 2 confirms.
        resp = confirm(CHAIN, 8, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms but reverted.
        resp = confirm(CHAIN, 8, REMOVE_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectErr(), "u230");
    },
    "testMagicBridgeFnTests": (CHAIN: Chain, WALLETS: string[]) => {

        // magic bridge address not set
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "mb-initialize-swapper",
                [types.principal(MAGIC_BRIDGE)],
                WALLETS[6]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u260"); 

        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "mb-escrow-swap",
                [
                    types.principal(MAGIC_BRIDGE),
                    types.tuple({header: types.buff("0x21133213"), height: types.uint(1)}),
                    types.list([]),
                    types.buff("0x21133213"),
                    types.tuple({ "tx-index": types.uint(1), hashes: types.list([]), "tree-depth": types.uint(1) }),
                    types.uint(1),
                    types.buff("0x21133213"),
                    types.buff("0x21133213"),
                    types.buff("0x21"),
                    types.buff("0x21133213"),
                    types.buff("0x21"),
                    types.uint(1),
                    types.uint(1)

                ],
                WALLETS[6]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u260"); 

        // Set magic bridge address with owner confirmations

        let resp =  submit(CHAIN, MAGIC_BRIDGE_SET_EXECUTOR, MAGIC_BRIDGE, null, WALLETS[3]);
        assertEquals(resp.expectOk(), "u9");

        resp = confirm(CHAIN, 9, MAGIC_BRIDGE_SET_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectOk(), "false");

        resp = confirm(CHAIN, 9, MAGIC_BRIDGE_SET_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "true");

        
        // It should pass ERR-INVALID-MB-ADDRESS check and fail at ERR-UNAUTHORIZED-SENDER
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "mb-initialize-swapper",
                [types.principal(MAGIC_BRIDGE)],
                WALLETS[6]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u130"); 

        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "mb-escrow-swap",
                [
                    types.principal(MAGIC_BRIDGE),
                    types.tuple({header: types.buff("0x21133213"), height: types.uint(1)}),
                    types.list([]),
                    types.buff("0x21133213"),
                    types.tuple({ "tx-index": types.uint(1), hashes: types.list([]), "tree-depth": types.uint(1) }),
                    types.uint(1),
                    types.buff("0x21133213"),
                    types.buff("0x21133213"),
                    types.buff("0x21"),
                    types.buff("0x21133213"),
                    types.buff("0x21"),
                    types.uint(1),
                    types.uint(1)

                ],
                WALLETS[6]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u130");
    }
}



Clarinet.test({
    name: "MultiSafe Tests",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const WALLETS = [...Array(9).keys()].map(x => accounts.get(`wallet_${x + 1}`)!.address);
        const DEPLOYER = accounts.get('deployer')!.address;

        for (let t of Object.keys(TESTS)) {
            TESTS[t](chain, WALLETS, DEPLOYER);
            console.log(`${t} ${green('ok')}`);
        }
    },
});
