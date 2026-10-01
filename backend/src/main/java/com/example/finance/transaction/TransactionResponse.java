package com.example.finance.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
    Long id,
    Long accountId,
    String accountName,
    LocalDate date,
    String description,
    BigDecimal amount,
    String category
) {
    public static TransactionResponse from(FinancialTransaction transaction) {
        return new TransactionResponse(
            transaction.getId(),
            transaction.getAccount().getId(),
            transaction.getAccount().getName(),
            transaction.getDate(),
            transaction.getDescription(),
            transaction.getAmount(),
            transaction.getCategory()
        );
    }
}
