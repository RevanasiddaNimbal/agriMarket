package com.agri.market.location.repository;

import com.agri.market.location.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DistrictRepository extends JpaRepository<District, String> {

    List<District> findAllByStateIdAndActiveTrueOrderByNameAsc(String stateId);

    @Query("""
            SELECT d
            FROM District d
            JOIN FETCH d.state s
            WHERE d.active = true
              AND s.active = true
              AND LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY d.name ASC
            """)
    List<District> searchActiveDistricts(@Param("query") String query);

    @Query("""
            SELECT d
            FROM District d
            WHERE d.state.id = :stateId
              AND d.active = true
              AND LOWER(REPLACE(REPLACE(REPLACE(d.name, ' ', ''), '-', ''), '_', '')) = :normalizedName
            """)
    Optional<District> findByStateIdAndNormalizedName(
            @Param("stateId") String stateId,
            @Param("normalizedName") String normalizedName
    );

    @Query("""
            SELECT d
            FROM District d
            JOIN FETCH d.state s
            WHERE LOWER(s.name) = LOWER(:stateName)
              AND LOWER(d.name) = LOWER(:districtName)
            """)
    Optional<District> findByStateNameAndDistrictName(
            @Param("stateName") String stateName,
            @Param("districtName") String districtName
    );
}