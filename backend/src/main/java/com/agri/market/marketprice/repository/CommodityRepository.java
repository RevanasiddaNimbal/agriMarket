package com.agri.market.marketprice.repository;

import com.agri.market.marketprice.entity.Commodity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommodityRepository extends JpaRepository<Commodity, String> {

    Optional<Commodity> findByNameIgnoreCase(String name);
}
