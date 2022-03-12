(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.executor-trait)
(use-trait safe-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.safe-trait)

(define-public (execute (safe <safe-trait>) (arg-p principal) (arg-u uint))
		(stx-transfer? arg-u (contract-of safe) arg-p)
)