package com.example.finance.transaction;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/recent")
    public List<TransactionResponse> recentTransactions(
        @RequestParam(defaultValue = "10") int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        PageRequest page = PageRequest.of(
            0,
            safeLimit,
            Sort.by(Sort.Direction.DESC, "date").and(Sort.by(Sort.Direction.DESC, "id"))
        );

        return transactionRepository.findAll(page)
            .stream()
            .map(TransactionResponse::from)
            .toList();
    }
}
