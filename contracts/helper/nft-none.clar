(define-non-fungible-token nft-none uint)

(define-read-only (get-last-token-id)
  (ok u99)
)

(define-public (transfer (id uint) (sender principal) (recipient principal))
    (nft-transfer? nft-none id sender recipient)   
)