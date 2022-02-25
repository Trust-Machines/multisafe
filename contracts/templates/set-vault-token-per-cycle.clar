(use-trait tx-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.tx-trait)
(use-trait wallet-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.wallet-trait)

(define-public (execute (wallet <wallet-trait>))
	  (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault set-token-per-cycle u1200)
)