import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';


let CHAIN: Chain;
let WALLETS:string[] = [];
let DEPLOYER: string = "";


Clarinet.test({
    name: "Setup",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        CHAIN = chain;
        WALLETS = [...Array(9).keys()].map(x => accounts.get(`wallet_${x+1}`)!.address);
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
                "set-min-confirmation",
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
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND"),
                    types.uint(0)
                ],
                WALLETS[3]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u130");

        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(0), 
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                ],
                WALLETS[3]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u130");      
    },
});


Clarinet.test({
    name: "Add a new owner",
    async fn() {
        // Check current owners. Should be 3.
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-owners",
                [],
                WALLETS[0]
              ),
        ]);

        let owners = block.receipts[0].result.expectList()
        assertEquals(owners.length, 3);
        assertEquals(owners[0], WALLETS[0]);
        assertEquals(owners[1], WALLETS[1]);
        assertEquals(owners[2], WALLETS[2]);

        // Start a new transaction to add a new owner.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal(WALLETS[3]),
                    types.uint(0)
                ],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u0");

        // The new transaction should be available in the transacions mapping.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-transaction",
                [types.uint(0)],
                WALLETS[0]
              ),
        ]);

        let tx:any = block.receipts[0].result.expectTuple()
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.confirmed, "false");
        assertEquals(confirmations.length, 1);
        assertEquals(confirmations[0], WALLETS[0]);

        // The user already confirmed transaction by submitting it. Should revert.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(0), 
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u150");

        // Destination parameter should be passed properly. Should revert.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(0),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u160");
        
        // Owner 2 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(0), 
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "true");

        // The transaction already confirmed. Should revert
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(0), 
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[2]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u180");


        // The transaction confirmed by sufficient number of owners.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-transaction",
                [types.uint(0)],
                WALLETS[0]
              ),
        ]);

        tx = block.receipts[0].result.expectTuple()
        confirmations = tx.confirmations.expectList()

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 2);
        assertEquals(confirmations[0], WALLETS[0]);
        assertEquals(confirmations[1], WALLETS[1]);

        // New owner should be added. should be 4.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-owners",
                [],
                WALLETS[0]
              ),
        ]);

        owners = block.receipts[0].result.expectList()
        assertEquals(owners.length, 4);
        assertEquals(owners[3], WALLETS[3]);

        // Nonce should be incremented.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-nonce",
                [],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result, "u1");
    },
});


Clarinet.test({
    name: "Set minimum confirmation requirement",
    async fn() {
        // Check current value. should be 2.
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-min-confirmation",
                [],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result, "u2");

        // Start a transaction to update minimum confirmation requirement.
         block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"), // TODO: Look for a zero address or dead address for Stacks chain.
                    types.uint(3)
                ],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u1");

        // // Owner 2 confirms. The transaction confirmed.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(1),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "true");

        // Minimum confirmation requirement should be updated as 3.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-min-confirmation",
                [],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result, "u3");
    },
});


Clarinet.test({
    name: "Remove an owner",
    async fn() {
        
        // Start a new transaction to remove an owner.
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5"),
                    types.uint(0)
                ],
                WALLETS[3]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u2");

        // Owner 2 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(2),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "false");

        // Owner 3 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(2), 
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[2]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "true");

        // The transaction confirmed.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-transaction",
                [types.uint(2)],
                WALLETS[0]
              ),
        ]);

        let tx:any = block.receipts[0].result.expectTuple()
        let confirmations = tx.confirmations.expectList()

        assertEquals(tx.confirmed, "true");
        assertEquals(confirmations.length, 3);
        assertEquals(confirmations[0], WALLETS[3]);
        assertEquals(confirmations[1], WALLETS[1]);
        assertEquals(confirmations[2], WALLETS[2]);
     
        // New owner should be added. Now we should have 4 owners.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-owners",
                [],
                WALLETS[0]
              ),
        ]);

        let owners = block.receipts[0].result.expectList()
        assertEquals(owners.length, 3);
    },
});


Clarinet.test({
    name: "Spend STX",
    async fn() {

        // Start a new transaction to send STX from the safe to another account
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"),
                    types.uint(50000000)
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u3");

       // Owner 2 confirms.
       block = CHAIN.mineBlock([
        Tx.contractCall(
            "safe",
            "confirm",
            [
                types.uint(3), 
                types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx"),
                types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
            ],
            WALLETS[2]
          ), 
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "false");

        // Owner 3 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(3),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[3]
            ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "true");      
        
        // The transaction confirmed. STX balance of the safe should be 0.
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
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"), // TODO: Look for a zero address or dead address for Stacks chain.
                    types.uint(1200)
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
                types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
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
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
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
                [types.list([types.uint(0), types.uint(1), types.uint(2), types.uint(3) , types.uint(4)])],
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
       
        assertEquals(block.receipts[0].result, '"0.0.1.alpha"');
    },
});


Clarinet.test({
    name: "Revoke",
    async fn() {

        // Tx not exists
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "revoke",
                [types.uint(10)],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), 'u140');

        // Tx already confirmed
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "revoke",
                [types.uint(4)],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), 'u180');


        // Start a new tx
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6"),
                    types.uint(50000000)
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u5");

        // Should reject becuase the owner hasn't confirmed the tx
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "revoke",
                [types.uint(5)],
                WALLETS[0]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), 'u190');

        // should revoke
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "revoke",
                [types.uint(5)],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), 'true');

        // confirmation should be removed
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "get-transaction",
                [types.uint(5)],
                WALLETS[0]
              ),
        ]);

        assertEquals(JSON.parse(JSON.stringify(block.receipts[0].result.expectTuple())).confirmations, '[]');
    },
});


Clarinet.test({
    name: "Set minimum confirmation - overflow protection test",
    async fn() {
        // Start a transaction to update minimum confirmation requirement.
        let block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "submit",
                [
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"), 
                    types.uint(21)
                ],
                WALLETS[1]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectOk(), "u6");

        // // Owner 2 confirms.
        block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(6),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[2]
              ),
        ]);

         // // Owner 3 confirms but tx reverted.
         block = CHAIN.mineBlock([
            Tx.contractCall(
                "safe",
                "confirm",
                [
                    types.uint(6),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation"),
                    types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe")
                ],
                WALLETS[3]
              ),
        ]);
        assertEquals(block.receipts[0].result.expectErr(), "u220"); 
    },
});