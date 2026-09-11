package com.agri.market.order.repository;

import com.agri.market.order.entity.Order;
import com.agri.market.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<Order, String>,
        JpaSpecificationExecutor<Order> {

    List<Order> findAllByUserIdOrderByCreatedDateDesc(
            String userId
    );

    long countByUserId(
            String userId
    );

    long countByUserIdAndStatus(
            String userId,
            OrderStatus status
    );

    long countByUserIdAndStatusIn(
            String userId,
            Collection<OrderStatus> statuses
    );

    Optional<Order> findByIdAndUserId(
            String orderId,
            String userId
    );

    List<Order> findAllByItemsProductFarmerIdOrderByCreatedDateDesc(
            String farmerId
    );

    @Query("""
            SELECT COUNT(DISTINCT o.id)
            FROM Order o
            JOIN o.items i
            WHERE i.product.farmer.id = :farmerId
              AND o.user.id <> :farmerId
              AND o.status <> com.agri.market.order.entity.OrderStatus.CANCELLED
            """)
    long countCustomerOrdersByFarmerId(
            @Param("farmerId") String farmerId
    );

    List<Order> findAllByStatusOrderByCreatedDateDesc(
            OrderStatus status
    );
}