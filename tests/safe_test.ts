import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';


let CHAIN: Chain;
let WALLETS: string[] = [];
let DEPLOYER: string = "";

const FT_NONE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.ft-none");
const NFT_NONE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-none");

const SAFE = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe");
const ADD_OWNER_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner");
const REMOVE_OWNER_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner");
const THRESHOLD_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-threshold");
const TRANSFER_STX_EXECUTOR = types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx");

const submit = (executor: any, paramP: string | null, paramU: number | null, txSender: string) => {
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

const addOwner = (newOwner: string, txSender: string) => {
    return submit(ADD_OWNER_EXECUTOR, newOwner, null, txSender);
}

const setThreshold = (threshold: number, txSender: string) => {
    return submit(THRESHOLD_EXECUTOR, null, threshold, txSender);
}

const removeOwner = (owner: string, txSender: string) => {
    return submit(REMOVE_OWNER_EXECUTOR, owner, null, txSender);
}

const transferStx = (recipient: string, amount: number, txSender: string) => {
    return submit(TRANSFER_STX_EXECUTOR, recipient, amount, txSender);
}

const confirm = (txId: number, executor: any, txSender: string) => {
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

const revoke = (txId: number, txSender: string) => {
    return CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "revoke",
            [types.uint(txId)],
            txSender
        ),
    ]).receipts[0].result;
}

const getOwners = () => {
    let block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-owners",
            [],
            WALLETS[0]
        ),
    ]);

    return block.receipts[0].result.expectList();
}

const getNonce = () => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-nonce",
            [],
            WALLETS[0]
        ),
    ]);

    return block.receipts[0].result;
}

const getThreshold = () => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-threshold",
            [],
            WALLETS[0]
        ),
    ]);
    return block.receipts[0].result;
}

const getTransaction = (txId: number) => {
    const block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "get-transaction",
            [types.uint(txId)],
            WALLETS[0]
        ),
    ]);

    return block.receipts[0].result.expectTuple()
}

Clarinet.test({
    name: "Setup",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        CHAIN = chain;
        WALLETS = [...Array(9).keys()].map(x => accounts.get(`wallet_${x + 1}`)!.address);
        DEPLOYER = accounts.get('deployer')!.address

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
});


Clarinet.test({
    name: "Safe only checks",
    async fn() {
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
});


Clarinet.test({
    name: "Onwer only checks",
    async fn() {
        let resp = addOwner("ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND", WALLETS[3]);
        assertEquals(resp.expectErr(), "u130");

        resp = confirm(0, ADD_OWNER_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u130");
    },
});


Clarinet.test({
    name: "Add a new owner",
    async fn() {
        // Check current owners. Should be 3.
        let owners = getOwners();
        assertEquals(owners.length, 3);
        assertEquals(owners[0], WALLETS[0]);
        assertEquals(owners[1], WALLETS[1]);
        assertEquals(owners[2], WALLETS[2]);

        // Start a new transaction to add a new owner.
        let resp = addOwner(WALLETS[3], WALLETS[0]);
        assertEquals(resp.expectOk(), "u0");

        // The new transaction should be available in the transacions mapping.
        let tx: any = getTransaction(0);
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.id, "u0");
        assertEquals(tx.confirmed, "false");
        assertEquals(confirmations.length, 1);
        assertEquals(confirmations[0], WALLETS[0]);

        // The user already confirmed transaction by submitting it. Should revert.
        resp = confirm(0, ADD_OWNER_EXECUTOR, WALLETS[0]);
        assertEquals(resp.expectErr(), "u150");

        // Executor should be passed properly. Should revert.
        resp = confirm(0, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectErr(), "u160");

        // Owner 2 confirms.
        resp = confirm(0, ADD_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "true");

        // The transaction already confirmed. Should revert
        resp = confirm(0, ADD_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectErr(), "u180");

        // The transaction confirmed by sufficient number of owners.
        tx = getTransaction(0);
        confirmations = tx.confirmations.expectList();

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 2);
        assertEquals(confirmations[0], WALLETS[0]);
        assertEquals(confirmations[1], WALLETS[1]);

        // New owner should be added. should be 4.
        owners = getOwners();
        assertEquals(owners.length, 4);
        assertEquals(owners[3], WALLETS[3]);

        // Nonce should be incremented.
        const nonce = getNonce();
        assertEquals(nonce, "u1");
    },
});


Clarinet.test({
    name: "Set confirmation threshold",
    async fn() {
        // Check current value. should be 2.
        let threshold = getThreshold();
        assertEquals(threshold, "u2");

        // Start a transaction to update minimum confirmation requirement.
        let resp = setThreshold(3, WALLETS[0]);
        assertEquals(resp.expectOk(), "u1");

        // // Owner 2 confirms. Confirmed.
        resp = confirm(1, THRESHOLD_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "true");

        // Minimum confirmation requirement should be updated as 3.
        threshold = getThreshold();
        assertEquals(threshold, "u3");
    },
});


Clarinet.test({
    name: "Remove an owner",
    async fn() {
        // Start a new transaction to remove an owner.
        let resp = removeOwner(WALLETS[0], WALLETS[3]);
        assertEquals(resp.expectOk(), "u2");

        // Owner 2 confirms.
        resp = confirm(2, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms.
        resp = confirm(2, REMOVE_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectOk(), "true");

        // Confirmed.
        let tx: any = getTransaction(2);
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 3);
        assertEquals(confirmations[0], WALLETS[3]);
        assertEquals(confirmations[1], WALLETS[1]);
        assertEquals(confirmations[2], WALLETS[2]);

        // Owner should be removed. Now we should have 3 owners.
        let owners = getOwners();
        assertEquals(owners.length, 3);
    },
});


Clarinet.test({
    name: "Spend STX",
    async fn() {
        // Start a new transaction to send STX from the safe to another account
        let resp = transferStx("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", 50000000, WALLETS[1]);
        assertEquals(resp.expectOk(), "u3");

        // Owner 2 confirms.
        resp = confirm(3, TRANSFER_STX_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms.
        resp = confirm(3, TRANSFER_STX_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectOk(), "true");

        // Confirmed. STX balance of the safe should be 0.
        const assetMap = CHAIN.getAssetsMaps();
        assertEquals(assetMap["assets"]["STX"]["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"], 0);
    },
});


Clarinet.test({
    name: "A vault ownership exmaple",
    async fn() {

        // We have an imaginary vault contract and owner of the contract is the safe contract
        // We want to update `token-per-cycle` by calling an owner only function `set-token-per-cycle`

        // Default token per cycle is u100
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "vault",
                "get-token-per-cycle",
                [],
                DEPLOYER
            ),
        ]);
        assertEquals(block.receipts[0].result, "u100");

        // The vault contract can't be updated directly by a user because it is owned by the safe contract
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "vault",
                "set-token-per-cycle",
                [types.uint(500)],
                DEPLOYER
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
                DEPLOYER
            ),
        ]);
        assertEquals(block.receipts[0].result, "u1200");
    },
});

Clarinet.test({
    name: "List transactions by ids",
    async fn() {
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
});

Clarinet.test({
    name: "Get version",
    async fn() {
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-version",
                [],
                WALLETS[0]
            ),
        ]);

        assertEquals(block.receipts[0].result, '"0.0.2.alpha"');
    },
});

Clarinet.test({
    name: "Get info",
    async fn() {
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
    },
});

Clarinet.test({
    name: "Revoke",
    async fn() {

        // Tx not exists.
        let resp = revoke(10, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u140');

        // Tx already confirmed.
        resp = revoke(4, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u180');

        // Start a new tx.
        resp = transferStx("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", 50000000, WALLETS[1]);
        assertEquals(resp.expectOk(), "u5");

        // Should reject becuase the owner hasn't confirmed the tx.
        resp = revoke(5, WALLETS[2]);
        assertEquals(resp.expectErr(), 'u190');

        // Should revoke.
        resp = revoke(5, WALLETS[1]);
        assertEquals(resp.expectOk(), 'true');

        // Confirmation should be removed.
        const tx = getTransaction(5);
        assertEquals(JSON.parse(JSON.stringify(tx)).confirmations, '[]');
    },
});


Clarinet.test({
    name: "Set minimum confirmation - overflow protection test",
    async fn() {
        // Start a transaction to set threshold.
        let resp = setThreshold(21, WALLETS[1]);
        assertEquals(resp.expectOk(), "u6");

        // Owner 2 confirms.
        resp = confirm(6, THRESHOLD_EXECUTOR, WALLETS[2]);

        // Owner 3 confirms but reverted.
        resp = confirm(6, THRESHOLD_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u220");
    },
});

Clarinet.test({
    name: "Set minimum confirmation - can't be higher than owner count",
    async fn() {
        // Start a transaction to set threshold.
        let resp = setThreshold(4, WALLETS[1]);
        assertEquals(resp.expectOk(), "u7");

        // Owner 2 confirms.
        resp = confirm(7, THRESHOLD_EXECUTOR, WALLETS[2]);

        // Owner 3 confirms but reverted.
        resp = confirm(7, THRESHOLD_EXECUTOR, WALLETS[3]);
        assertEquals(resp.expectErr(), "u230");
    },
});


Clarinet.test({
    name: "Remove an owner - owner count cannot be lower than threshold",
    async fn() {
        // Start a new transaction to remove an owner.
        let resp = removeOwner(WALLETS[3], WALLETS[3]);
        assertEquals(resp.expectOk(), "u8");

        // Owner 2 confirms.
        resp = confirm(8, REMOVE_OWNER_EXECUTOR, WALLETS[1]);
        assertEquals(resp.expectOk(), "false");

        // Owner 3 confirms but reverted.
        resp = confirm(8, REMOVE_OWNER_EXECUTOR, WALLETS[2]);
        assertEquals(resp.expectErr(), "u230");
    },
});