package com.agri.market.inventory.repository;

import com.agri.market.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, String> {

    Optional<Inventory> findByProductId(String productId);

    List<Inventory> findAllByProductFarmerId(String farmerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Inventory i
            JOIN FETCH i.product p
            WHERE i.product.id = :productId
            """)
    Optional<Inventory> findByProductIdForUpdate(
            @Param("productId") String productId
    );

    @Query("""
            SELECT i
            FROM Inventory i
            JOIN FETCH i.product p
            WHERE p.farmer.id = :farmerId
            ORDER BY i.createdAt DESC
            """)
    List<Inventory> findAllByFarmerId(
            @Param("farmerId") String farmerId
    );

    @Query("""
            SELECT COUNT(i)
            FROM Inventory i
            WHERE i.product.farmer.id = :farmerId
            """)
    long countByFarmerId(
            @Param("farmerId") String farmerId
    );
}

