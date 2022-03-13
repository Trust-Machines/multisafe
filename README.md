# Multi-Safe

A multi-owner contract to manage Stacks Blockchain resources that requires n number of confirmations.

## Features

- Can hold STX, SIP-009 NFT and SIP-010 FT
- UI support (coming soon)
- Integration with Hiro wallet

---

## API Reference

### Owner only functions

`submit (executor <executor-trait>, safe <safe-trait>, param-p principal, param-u uint) => (response uint)`

`confirm (tx-id uint, executor <executor-trait>, safe <safe-trait>) => (response uint)`

`revoke (tx-id uint) => (response bool)`

### Safe only functions

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