(define-fungible-token none-token)

(define-read-only (get-name)
  (ok "None")
)

(define-read-only (get-symbol)
  (ok "NONE")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance none-token account))
  
)
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(ft-transfer? none-token amount sender recipient)
)