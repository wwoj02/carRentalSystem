package com.carrental.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReportIntegrationTest {

    private static final String CUSTOMER_EMAIL = "john.smith@example.com";
    private static final String EMPLOYEE_EMAIL = "employee@rentacar.com";
    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    private String customerToken;
    private String employeeToken;

    @BeforeEach
    void setUp() throws Exception {
        customerToken = IntegrationTestSupport.obtainToken(mockMvc, CUSTOMER_EMAIL, PASSWORD);
        employeeToken = IntegrationTestSupport.obtainToken(mockMvc, EMPLOYEE_EMAIL, PASSWORD);
    }

    @Test
    void reportsEndpointReturns403ForCustomer() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .param("from", "2026-06-01")
                        .param("to", "2026-06-30")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void reportsEndpointReturns200ForEmployee() throws Exception {
        mockMvc.perform(get("/api/reports/summary")
                        .param("from", "2026-06-01")
                        .param("to", "2026-06-30")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").isNumber());
    }
}
