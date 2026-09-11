package com.agri.market.product.repository;

import com.agri.market.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, String>,
        JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndFarmer_Id(
            String productId,
            String farmerId
    );

    boolean existsByNameIgnoreCaseAndFarmer_Id(
            String name,
            String farmerId
    );

    boolean existsByIdAndFarmer_Id(
            String productId,
            String farmerId
    );

    long countByFarmer_IdAndStatus(
            String farmerId,
            String status
    );

    long countByFarmer_Id(
            String farmerId
    );
}