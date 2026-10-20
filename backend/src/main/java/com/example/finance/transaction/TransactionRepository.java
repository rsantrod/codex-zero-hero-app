package com.example.finance.transaction;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    @Override
    @EntityGraph(attributePaths = "account")
    Page<FinancialTransaction> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "account")
    Page<FinancialTransaction> findByCategory(String category, Pageable pageable);

    @Query("select distinct transaction.category from FinancialTransaction transaction order by transaction.category")
    List<String> findDistinctCategories();
}
