ALTER TABLE payment_transactions
DROP CONSTRAINT fk_payment_transaction_order;

DROP INDEX idx_payment_transactions_order_id;

ALTER TABLE payment_transactions
DROP COLUMN order_id;