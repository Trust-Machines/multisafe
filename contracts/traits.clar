(define-trait safe-trait
	(
		(add-owner (principal) (response bool uint))
		(remove-owner (principal) (response bool uint))
		(set-min-confirmation (uint) (response bool uint))
	)
)

(define-trait executor-trait
	(
		(execute (<safe-trait> principal uint) (response bool uint))
	)
)

