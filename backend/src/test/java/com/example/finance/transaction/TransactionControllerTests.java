package com.example.finance.transaction;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.finance.FinanceApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = FinanceApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TransactionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsRecentSeededTransactions() throws Exception {
        mockMvc.perform(get("/api/transactions/recent?limit=3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[0].description").value("Fictional payroll deposit"))
            .andExpect(jsonPath("$[0].accountName").value("Everyday Checking"));
    }
}
