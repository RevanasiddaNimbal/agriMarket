package com.agri.market.address.repository;

import com.agri.market.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, String> {

    @Query("""
            SELECT a
            FROM Address a
            LEFT JOIN FETCH a.taluk t
            LEFT JOIN FETCH t.district d
            LEFT JOIN FETCH d.state s
            WHERE a.user.id = :userId
            ORDER BY a.defaultAddress DESC, a.createdDate DESC
            """)
    List<Address> findAllByUserId(
            @Param("userId") String userId
    );

    @Query("""
            SELECT a
            FROM Address a
            LEFT JOIN FETCH a.taluk t
            LEFT JOIN FETCH t.district d
            LEFT JOIN FETCH d.state s
            WHERE a.id = :addressId
            AND a.user.id = :userId
            """)
    Optional<Address> findByIdAndUserId(
            @Param("addressId") String addressId,
            @Param("userId") String userId
    );

    @Query("""
            SELECT a
            FROM Address a
            LEFT JOIN FETCH a.taluk t
            LEFT JOIN FETCH t.district d
            LEFT JOIN FETCH d.state s
            WHERE a.user.id = :userId
            AND a.defaultAddress = true
            """)
    Optional<Address> findDefaultAddressByUserId(
            @Param("userId") String userId
    );

    @Query("""
            SELECT COUNT(a)
            FROM Address a
            WHERE a.user.id = :userId
            """)
    long countByUserId(
            @Param("userId") String userId
    );

    @Modifying
    @Query("""
            UPDATE Address a
            SET a.defaultAddress = false
            WHERE a.user.id = :userId
            AND a.defaultAddress = true
            """)
    int clearDefaultAddressByUserId(
            @Param("userId") String userId
    );
}