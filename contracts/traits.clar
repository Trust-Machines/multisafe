;; Title: MultiSafe traits
;; Author: Talha Bugra Bulut & Trust Machines

(define-trait safe-trait
	(
		(add-owner (principal) (response bool uint))
		(remove-owner (principal) (response bool uint))
		(set-min-confirmation (uint) (response bool uint))
	)
)

(define-trait executor-trait
	(
		(execute (<safe-trait> (optional principal) (optional uint) (optional (buff 20))) (response bool uint))
	)
)

