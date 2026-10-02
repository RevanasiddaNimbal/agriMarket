package com.agri.market.marketprice.repository;

import com.agri.market.marketprice.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, String> {

    Optional<Market> findByDistrictIdAndNameIgnoreCase(String districtId, String name);

    @Query("""
            SELECT m
            FROM Market m
            JOIN FETCH m.district d
            JOIN FETCH d.state s
            WHERE LOWER(s.name) = LOWER(:state)
              AND LOWER(d.name) = LOWER(:district)
              AND LOWER(m.name) = LOWER(:market)
            """)
    Optional<Market> findByStateDistrictAndMarket(
            @Param("state") String state,
            @Param("district") String district,
            @Param("market") String market
    );

    List<Market> findByDistrictIdOrderByNameAsc(String districtId);
}
