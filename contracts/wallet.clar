;; A multi-signature wallet

(use-trait executor-trait .traits.executor-trait)
(use-trait wallet-trait .traits.wallet-trait)

(impl-trait .traits.wallet-trait)

;; errors
(define-constant ERR-CALLER-MUST-BE-SELF (err u100))
(define-constant ERR-OWNER-ALREADY-EXISTS (err u110))
(define-constant ERR-OWNER-NOT-EXISTS (err u120))
(define-constant ERR-UNAUTHORIZED-SENDER (err u130))
(define-constant ERR-TX-NOT-FOUND (err u140))
(define-constant ERR-TX-ALREADY-CONFIRMED-BY-OWNER (err u150))
(define-constant ERR-TX-INVALID-EXECUTOR (err u160))
(define-constant ERR-INVALID-WALLET (err u170))
(define-constant ERR-TX-CONFIRMED (err u180))
(define-constant ERR-TX-NOT-CONFIRMED-BY-SENDER (err u190))

;; version
(define-constant VERSION "0.0.1.alpha")

(define-read-only (get-version)
    VERSION
)

;; principal of the deployed contract
(define-constant self (as-contract tx-sender))


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
        (asserts! (is-eq tx-sender self) ERR-CALLER-MUST-BE-SELF)
        (asserts! (is-none (index-of (var-get owners) owner)) ERR-OWNER-ALREADY-EXISTS)
        (ok (add-owner-internal owner))
    )
)

(define-data-var rem-owner principal tx-sender)

(define-private (remove-owner-filter (o principal)) (not (is-eq o (var-get rem-owner))))

(define-public (remove-owner (owner principal))
    (begin
        (asserts! (is-eq tx-sender self) ERR-CALLER-MUST-BE-SELF)
        (asserts! (not ( is-none (index-of (var-get owners) owner) )) ERR-OWNER-NOT-EXISTS)
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
        (asserts! (is-eq tx-sender self) ERR-CALLER-MUST-BE-SELF) 
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

(define-data-var rem-confirmation principal tx-sender)

(define-private (remove-confirmation-filter (o principal)) (not (is-eq o (var-get rem-confirmation))))

(define-public (revoke (tx-id uint))
    (let 
        (
            (tx (unwrap! (map-get? transactions tx-id) ERR-TX-NOT-FOUND))
            (confirmations (get confirmations tx))
        )
        (asserts! (is-eq (get confirmed tx) false) ERR-TX-CONFIRMED)
        (asserts! (is-some (index-of confirmations tx-sender)) ERR-TX-NOT-CONFIRMED-BY-SENDER)
        (var-set rem-confirmation tx-sender)
        (let 
            (
                (new-confirmations  (unwrap-panic (as-max-len? (filter remove-confirmation-filter confirmations) u50)))
                (new-tx (merge tx {confirmations: new-confirmations}))
            )
            (map-set transactions tx-id new-tx)
            (ok true)
        )
    )
)

(define-public (confirm (tx-id uint) (executor <executor-trait>) (wallet <wallet-trait>))
    (begin
        (asserts! (is-some (index-of (var-get owners) tx-sender)) ERR-UNAUTHORIZED-SENDER)
        (asserts! (is-eq (contract-of wallet) self) ERR-INVALID-WALLET) 
        (let
            (
                (tx (unwrap! (map-get? transactions tx-id) ERR-TX-NOT-FOUND))
                (confirmations (get confirmations tx))
            )

            (asserts! (is-none (index-of confirmations tx-sender)) ERR-TX-ALREADY-CONFIRMED-BY-OWNER)
            (asserts! (is-eq (get executor tx) (contract-of executor)) ERR-TX-INVALID-EXECUTOR)
            
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
        (asserts! (is-some (index-of (var-get owners) tx-sender)) ERR-UNAUTHORIZED-SENDER)
        (asserts! (is-eq (contract-of wallet) self) ERR-INVALID-WALLET) 
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
        (set-min-confirmation-internal m)
    )
)

(init (list 
    'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
) u2)