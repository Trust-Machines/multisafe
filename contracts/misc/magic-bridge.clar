(impl-trait .traits.magic-bridge-trait)

(define-public (initialize-swapper)
    (begin 
        (asserts! (is-eq true true) (err u100))
        (ok u1)
    )
)

(define-public (escrow-swap 
    (block { header: (buff 80), height: uint })
    (prev-blocks (list 10 (buff 80)))
    (tx (buff 1024))
    (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint })
    (output-index uint)
    (sender (buff 33))
    (recipient (buff 33))
    (expiration-buff (buff 4))
    (hash (buff 32))
    (swapper-buff (buff 4))
    (supplier-id uint)
    (min-to-receive uint)
  )
    (begin 
        (asserts! (is-eq true true) (err u100))
        (ok {
     	sender-public-key: 0x21133213,
		output-index: u1,
		csv: u2,
		redeem-script: 0x21133213,
		sats: u100
      })
    )
)

(define-public (initiate-outbound-swap (xbtc uint) (btc-version (buff 1)) (btc-hash (buff 20)) (supplier-id uint))
    (begin 
        (asserts! (is-eq true true) (err u100))
        (ok u1)
    )
)