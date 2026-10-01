package com.example.finance.account;

import java.math.BigDecimal;

public record AccountResponse(
    Long id,
    String name,
    String type,
    BigDecimal currentBalance
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(
            account.getId(),
            account.getName(),
            account.getType(),
            account.getCurrentBalance()
        );
    }
}
