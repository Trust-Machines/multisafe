;; A multi-signature wallet prototype

(use-trait executor-trait .traits.executor-trait)
(use-trait wallet-trait .traits.wallet-trait)

(impl-trait .traits.wallet-trait)

;; errors
(define-constant err-caller-must-be-self (err u100))
(define-constant err-owner-already-exists (err u110))
(define-constant err-owner-not-exists (err u120))
(define-constant err-tx-unauthorized-sender (err u130))
(define-constant err-tx-not-found (err u140))
(define-constant err-tx-already-confirmed (err u150))
(define-constant err-tx-invalid-executor (err u160))
(define-constant err-tx-invalid-wallet (err u170))


;; principal of the deployed contract
(define-data-var self principal (as-contract tx-sender))


;; owners
(define-data-var owners (list 50 principal) (list)) 

(define-read-only (get-owners)
    (var-get owners)
)

(define-private (add-owner-internal (owner principal))
    (var-set owners (unwrap-panic (as-max-len? (append (var-get owners) owner) u50)))
)

(define-public (add-owner (owner principal))
    (begin
        (asserts! (is-eq tx-sender (var-get self)) err-caller-must-be-self)
        (asserts! (is-none (index-of (var-get owners) owner)) err-owner-already-exists)
        (ok (add-owner-internal owner))
    )
)

(define-data-var rem-owner principal tx-sender)

(define-private (remove-owner-filter (o principal)) (not (is-eq o (var-get rem-owner))))

(define-public (remove-owner (owner principal))
    (begin
        (asserts! (is-eq tx-sender (var-get self)) err-caller-must-be-self)
        (asserts! (not ( is-none (index-of (var-get owners) owner) )) err-owner-not-exists)
        (var-set rem-owner owner)
        (ok (var-set owners (unwrap-panic (as-max-len? (filter remove-owner-filter (var-get owners)) u50))))
    )
)


;; minimum confirmation requirement 
(define-data-var min-confirmation uint u0)

(define-read-only (get-min-confirmation)
    (var-get min-confirmation)
)

(define-private (set-min-confirmation-internal (value uint))
    (var-set min-confirmation value)
)

(define-public (set-min-confirmation (value uint))
    (begin
        (asserts! (is-eq tx-sender (var-get self)) err-caller-must-be-self) 
        (ok (set-min-confirmation-internal value))
    )
)

;; nonce
(define-data-var nonce uint u0)

(define-read-only (get-nonce)
    (var-get nonce)
)

(define-private (increase-nonce)
    (var-set nonce (+ (var-get nonce) u1))
)

;; transactions
(define-map transactions 
    uint 
    {
        executor: principal,
        confirmations: (list 50 principal),
        confirmed: bool,
        arg-p: principal,
        arg-u: uint
    }
)

(define-private (add (executor <executor-trait>) (arg-p principal) (arg-u uint))
    (let 
        (
            (tx-id (get-nonce))
        ) 
        (map-insert transactions tx-id {executor: (contract-of executor), confirmations: (list), confirmed: false, arg-p: arg-p, arg-u: arg-u})
        (increase-nonce)
        tx-id
    )
)

(define-read-only (get-transaction (tx-id uint))
    (unwrap-panic (map-get? transactions tx-id))
)

(define-read-only (get-transactions (tx-ids (list 20 uint)))
    (map get-transaction tx-ids)
)

(define-public (confirm (tx-id uint) (executor <executor-trait>) (wallet <wallet-trait>))
    (begin
        (asserts! (not (is-none (index-of (var-get owners) tx-sender))) err-tx-unauthorized-sender)
        (asserts! (is-eq (contract-of wallet) (var-get self)) err-tx-invalid-wallet) 
        (let
            (
                (tx (unwrap! (map-get? transactions tx-id) err-tx-not-found))
                (confirmations (get confirmations tx))
            )

            (asserts! (is-none (index-of confirmations tx-sender)) err-tx-already-confirmed)
            (asserts! (is-eq (get executor tx) (contract-of executor)) err-tx-invalid-executor)
            
            (let 
                (
                    (new-confirmations (unwrap-panic (as-max-len? (append confirmations tx-sender) u50)))
                    (confirmed (>= (len new-confirmations) (var-get min-confirmation)))
                    (new-tx (merge tx {confirmations: new-confirmations, confirmed: confirmed}))
                )
                (map-set transactions tx-id new-tx)
                (if confirmed 
                    (try! (as-contract (contract-call? executor execute wallet (get arg-p tx) (get arg-u tx))))
                    false
                )
                (ok confirmed)
            )
        )
    )
)

(define-public (submit (executor <executor-trait>) (wallet <wallet-trait>) (arg-p principal) (arg-u uint))
    (begin
        (asserts! (not (is-none (index-of (var-get owners) tx-sender))) err-tx-unauthorized-sender)
        (asserts! (is-eq (contract-of wallet) (var-get self)) err-tx-invalid-wallet) 
        (let
            ((tx-id (add executor arg-p arg-u)))
            (unwrap-panic (confirm tx-id executor wallet))
            (ok tx-id)
        )
    )
)


;; init
(define-private (init (o (list 50 principal)) (m uint))
    (begin
        (map add-owner-internal o)
        (set-min-confirmation-internal u2)
    )
)

(init (list 
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
) u2)