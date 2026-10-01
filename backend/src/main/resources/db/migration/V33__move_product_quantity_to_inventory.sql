ALTER TABLE inventory
    ADD COLUMN total_quantity NUMERIC(19, 3) NOT NULL DEFAULT 0;

UPDATE inventory
SET total_quantity = products.quantity
FROM products
WHERE inventory.product_id = products.id;

ALTER TABLE inventory
    ADD CONSTRAINT chk_inventory_total_quantity
        CHECK (total_quantity >= 0);

ALTER TABLE inventory
    ADD CONSTRAINT chk_inventory_reserved_le_total
        CHECK (reserved_quantity <= total_quantity);

ALTER TABLE products
    DROP COLUMN quantity;
