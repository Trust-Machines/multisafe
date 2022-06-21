;; Title: Executor for swapping xbtc to native btc using 0th supplier
;; Author: Talha Bugra Bulut & Trust Machines

(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.executor-trait)
(use-trait safe-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.safe-trait)
(use-trait nft-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.sip-009-trait)
(use-trait ft-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.sip-010-trait)

(define-public (execute (safe <safe-trait>) (param-ft <ft-trait>) (param-nft <nft-trait>) (param-p (optional principal)) (param-u (optional uint)) (param-b (optional (buff 20))))
    (begin 
        (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.magic-bridge initiate-outbound-swap (unwrap! param-u (err u9999)) 0x00 (unwrap! param-b (err u9999)) u0))
        (ok true)
    )
)