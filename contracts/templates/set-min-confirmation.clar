(use-trait tx-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.tx-trait)

(define-public (execute)
	  (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig set-min-confirmation u3)
)