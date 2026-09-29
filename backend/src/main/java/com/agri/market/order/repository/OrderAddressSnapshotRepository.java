package com.agri.market.order.repository;

import com.agri.market.order.entity.OrderAddressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderAddressSnapshotRepository
        extends JpaRepository<OrderAddressSnapshot, String> {

    Optional<OrderAddressSnapshot> findByOrderId(
            String orderId
    );
}
