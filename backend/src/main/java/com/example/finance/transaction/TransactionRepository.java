package com.example.finance.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    @Override
    @EntityGraph(attributePaths = "account")
    Page<FinancialTransaction> findAll(Pageable pageable);
}
