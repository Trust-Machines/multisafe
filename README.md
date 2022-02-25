# Multi-Signature Wallet for Stacks Blockchain

The purpose of multi-signature wallets is to improve security by requiring multiple parties to agree on transactions before execution. Transactions created by a multi-signature wallet can be executed only when confirmed by a sufficient number of owners. 

## How this multi-signature wallet works?

An owner starts a multi-signature transaction by submitting address of a contract they deployed to Stacks blockchain that contains execution code. The code gets executed once it receives enough confirmations from other owners.

## Why we need to deploy a separated contract to conduct a multi-signature transaction?

Unlike EVM, Clarity doesn't support byte data execution by design. Any code piece deployed to Stacks blockchain is visible by everyone without needing someone to verify the code.

So with Clarity, we can't push an abi encoded data to smart contracts to execute later but we can deploy a separated contract that contains all execution code and submit it to a multi-signature transaction to run it with the multi-signature wallet's authority. A more transparent way to conduct multi-signature transactions. 

## Templates

Some contract templates can be found under the templates directory and give an idea about the multi-signature contract's capabilities.

---

## Getting Started

Before getting started please make sure you have [Clarinet](https://docs.hiro.so/smart-contracts/clarinet) install. 

If you are not familiar with Clarinet [this tutorial](https://www.youtube.com/watch?v=zERDftjl6k8) can help you.

By default three owners added to multi-signature wallet and default minimum confirmation requirement is two. See in the ending of [multisig.clar](contracts/multisig.clar):

```
(add-owner-internal 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(add-owner-internal 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(add-owner-internal 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
(set-min-confirmation-internal u2)
```

## Testing

There are several tests in the tests/multisig_tests.ts

Run ```clarinet test``` to see test results.

## Usage


### Contract ownership example

Let's imagine we have a vault contract owned by a  multi-signature wallet and we want to update `token-per-cycle` data-var  by calling an owner only function `set-token-per-cycle`

To simulate this example we'll use [set-vault-token-per-cycle](contracts/templates/set-vault-token-per-cycle.clar) template and [vault](contracts/helpers/vault.clar) helper contract.

**1- See current `token-per-cycle` value**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault get-token-per-cycle)```

> u100

**2- Make sure owner of the vault contract is the multi-signature wallet**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault set-token-per-cycle u500)```

> (err u900)

**3- Switch to the first owner and start transaction with `set-vault-token-per-cycle` template**
`::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5`

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-vault-token-per-cycle)`

> (ok u0) <small>the number next to ok is the new transaction id.</small>

**4- Confirm the transaction with the second owner**
`::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`

```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig confirm-transaction u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-vault-token-per-cycle)```

> (ok true) <small>"true" means that the transaction has been received enough confirmations and executed.</small>

**5- See `token-per-cycle` updated.**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault get-token-per-cycle)```

> u1200

---

### STX transfer

Imagine we manage some STX funds on a multi-signature wallet and we'll move them to another account on Stacks blockchain. 

We'll use [transfer-stx](contracts/templates/transfer-stx.clar) template to simulate this example 

**1- Switch to the third owner and send some STX to multi-signature contract to simulate this example**
`::set_tx_sender ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC`

`(stx-transfer? u50000000 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig)`

**2- Start transaction with `transfer-stx` template**
`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx)`

> (ok u0)

**2- Confirm the transaction with the second owner**
`::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`

```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig confirm-transaction u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.transfer-stx)```

> (ok true)

---

### Wallet only functions

Following functions can be executed by only the multi-signature contract and requires sufficient owner confirmations.  

- `add-owner (owner principal)`
- `remove-owner (owner principal)`
- `set-min-confirmation (value uint)`

#### Adding a new owner

**1- See all owners of the wallet**
```(contract-call? .multisig get-owners)```

>[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC]

**2- Switch to the first owner**
`::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5`

**3- Submit a new transaction with 'add-owner' template**
`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner)`

>(ok u0)

**4- Switch to the third owner**
```::set_tx_sender ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC```

**5- Confirm the transaction** 
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig confirm-transaction u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.add-owner)```

> (ok true) 

**6- See the new owner added**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig get-owners)```

>[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC, ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND]

---

#### Removing an owner

**1- Switch to the second owner**
`::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`

**2- Submit a new transaction with 'remove-owner' template**
`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner)`

>(ok u0)

**3- Switch to the third owner and confirm the transaction** 
```::set_tx_sender ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC```

```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig confirm-transaction u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.remove-owner)```

> (ok true) 

**5- See the owner removed**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig get-owners)```

>[ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG, ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC]

---

#### Updating minimum confirmation requirement

**1- See current requirement**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig get-min-confirmation)```

>u2

**2- Switch to the first owner and submit a new transaction with 'set-min-confirmation' template**

`::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5`

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig submit 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation)`

>(ok u0)

**3- Switch to the first owner and confirm the transaction**
`::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`

```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig confirm-transaction u0 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.set-min-confirmation)```

> (ok true)

**4- See the minimum confirmation requirement updated**
```(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig get-min-confirmation)```

> u3

