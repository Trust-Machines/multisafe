(use-trait tx-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.tx-trait)
(use-trait wallet-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.wallet-trait)

(define-public (execute (wallet <wallet-trait>))
	(contract-call? wallet add-owner 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND)
)