;; Title: MultiSafe minimum confirmation update executor
;; Author: Talha Bugra Bulut & Trust Machines

(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.executor-trait)
(use-trait safe-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.safe-trait)

(define-public (execute (safe <safe-trait>) (arg-p (optional principal)) (arg-u (optional uint)) (arg-b (optional (buff 20))))
		(contract-call? safe set-min-confirmation (unwrap! arg-u (err u9999)))
)