package com.agri.market.location.repository;

import com.agri.market.location.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StateRepository extends JpaRepository<State, String> {

    List<State> findAllByActiveTrueOrderByNameAsc();

    Optional<State> findByNameIgnoreCaseAndActiveTrue(String name);

    Optional<State> findByNameIgnoreCase(String name);

    @Query("""
            SELECT s
            FROM State s
            WHERE s.active = true
              AND LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY s.name ASC
            """)
    List<State> searchActiveStates(@Param("query") String query);
}