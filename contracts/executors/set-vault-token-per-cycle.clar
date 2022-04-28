;; Title: MultiSafe contract ownership simulation executor
;; Author: Talha Bugra Bulut & Trust Machines

(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.executor-trait)
(use-trait safe-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.safe-trait)

(define-public (execute (safe <safe-trait>) (arg-p (optional principal)) (arg-u (optional uint)) (arg-b (optional (buff 20))))
	  (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault set-token-per-cycle (unwrap! arg-u (err u9999)))
)