(use-trait tx-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.tx-trait)
(use-trait wallet-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.wallet-trait)

(define-public (execute (wallet <wallet-trait>))
		(contract-call? wallet set-min-confirmation u3)
)