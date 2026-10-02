package com.agri.market.product.repository;

import com.agri.market.product.entity.ProductLocationSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductLocationSnapshotRepository extends JpaRepository<ProductLocationSnapshot, String> {
}
