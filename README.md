# Multi-Safe

MultiSafe is a shared crypto wallet for managing Stacks (STX) and Bitcoin (BTC). 

## Features

Current supported features: 
- Send, transfer and hold STX
- Supports up to 20 owners

Future updates (coming soon): 
- User-friendly app 
- SIP-009 Non-fungible token and SIP-010 Fungible token support 
- Native Bitcoin (BTC) support

## Requires Clarinet 

Install Clarinet: https://github.com/hirosystems/clarinet

MultiSafe is written in Clarity and therefore requires you to install Clarient locally on the command line. Type the following command to check that you have Clarinet installed: 

```bash
$ clarinet --version
```

## Download MultiSafe  

1. Clone the repo: 

```bash
$ git clone https://github.com/Trust-Machines/multisafe.git && cd multisafe
```

2. Run the unit test to confirm all the tests passed and everything is working: 

```bash
$ Clarinet test
```

3. Open the Clarinet console in order to interact with the contract 

```bash
$ Clarinet console
```

# Usage 

## Setup the first MultiSafe owners

Go to `/contracts/safe.clar`. At the bottom of that contract you'll see a list with three sample owners. These are the default Clarinet wallets that you can use for testing locally in Clarient.

```clarity
(init (list 
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
) u2)
```

If you'd like to deploy to mainnet/testnet update those wallet addresses with your own wallet addresses. 

## Get Safe Owners 


```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe get-owners)
```

In the example above `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe` is your safe's contract name. 

`get-owners` will return `[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC]`

## Get minimum confirmations 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe get-min-confirmation)
```

The Clarinet console demo will return `u2`

In this example “u2” tells us that we need a minimum of 2 confirmations in order to approve a transaction 

## Add new users 

1. Change the transaction sender to “wallet_1”

```clarity
::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
```

2. Add a new user to the wallet. In this example, we add “wallet_9” to MultiSafe. 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6 u0)
```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM = deployer 
'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6 = wallet_9

3. If you “get-owners” you’ll see that there are still only 3 owners. In order to confirm the 4th owner you will need to switch to “wallet_2” or “wallet_3” (the other owner”) and approve the transaction.  

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe get-owners)
```

Returns: `[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC]`

4. Change owner to wallet_2

```clarity
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
```

5. As wallet_2 owner, now you can approve the 4th new owner 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe confirm u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe)`
```

6. Call “get-owners” again and you will see the 4th owner has been added 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe get-owners)
```

Returns: `[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC, STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6]`

## Send STX to the MultiSafe 

If you are the wallet_3 owner (ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC) then the following command will allow you to send STX from your wallet to the MultiSafe 

```clarity
(stx-transfer? u5000 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe)
```

`::get_assets_maps` will show you that the STX has been transfered into the .safe MultiSafe`

## Send STX from MultiSafe to a new wallet 

In this example, using Clarinet console, we will send STX from MultiSafe to "wallet_7"

1. Send STX to wallet_7 

Assuming you are an owner — in this example, you will send 1000 STX from the MultisSafe to wallet_7 (ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ). 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ u1000)
```

2. Change owner to wallet_2

```clarity
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
```

3. Wallet_2 can now confirm the transaction 

```clarity
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe confirm u1 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.safe)
```

MultiSafe now has -1000 STX, and wallet_7 +1000 STX 

## Security

The code hasn't audited by a independent security team yet. Use at your own risk. 

We are planning an audit for June 2022, and would love your help debugging the code prior to our audit. Please report any bugs as a Github Issue or on Twitter https://twitter.com/multisafexyz

## API Reference

### Owner only functions

The following function can be run by only safe owners:

`submit (executor <executor-trait>, safe <safe-trait>, param-p principal, param-u uint) => (response uint)`

`confirm (tx-id uint, executor <executor-trait>, safe <safe-trait>) => (response bool)`

`revoke (tx-id uint) => (response bool)`

### Safe only functions

The following functions can be run by only safe contract itself and requires the minimum number of confirmations:

`add-owner (owner principal) => (response bool)` 

`remove-owner (owner principal) => (response bool)`

`set-min-confirmation (value uint) => (response bool)`

### Views (Read only functions)

`get-version() => string-ascii`

`get-owners() => list`

`get-min-confirmation() => uint`

`get-nonce() => uint`

`get-transaction (tx-id uint) => tuple`

`get-transactions (tx-ids (list 20 uint)) => list`
