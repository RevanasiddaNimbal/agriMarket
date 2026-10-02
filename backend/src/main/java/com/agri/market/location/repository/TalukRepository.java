package com.agri.market.location.repository;

import com.agri.market.location.entity.Taluk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TalukRepository extends JpaRepository<Taluk, String> {

    List<Taluk> findAllByDistrictIdAndActiveTrueOrderByNameAsc(String districtId);

    @Query("""
            SELECT t
            FROM Taluk t
            JOIN FETCH t.district d
            JOIN FETCH d.state s
            WHERE t.active = true
              AND d.active = true
              AND s.active = true
              AND LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY t.name ASC
            """)
    List<Taluk> searchActiveTaluks(@Param("query") String query);

    @Query("""
            SELECT t
            FROM Taluk t
            WHERE t.district.id = :districtId
              AND t.active = true
              AND LOWER(REPLACE(REPLACE(REPLACE(t.name, ' ', ''), '-', ''), '_', '')) = :normalizedName
            """)
    Optional<Taluk> findByDistrictIdAndNormalizedName(
            @Param("districtId") String districtId,
            @Param("normalizedName") String normalizedName
    );

    @Query("""
            SELECT t
            FROM Taluk t
            JOIN FETCH t.district d
            JOIN FETCH d.state s
            WHERE t.active = true
              AND d.active = true
              AND s.active = true
              AND LOWER(REPLACE(REPLACE(REPLACE(t.name, ' ', ''), '-', ''), '_', '')) = :normalizedName
            ORDER BY s.name ASC, d.name ASC, t.name ASC
            """)
    List<Taluk> findActiveByNormalizedName(
            @Param("normalizedName") String normalizedName
    );
}