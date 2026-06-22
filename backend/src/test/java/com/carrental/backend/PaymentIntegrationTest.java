package com.carrental.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class PaymentIntegrationTest {

    private static final String CUSTOMER_EMAIL = "john.smith@example.com";
    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = IntegrationTestSupport.objectMapper();

    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        customerToken = IntegrationTestSupport.obtainToken(mockMvc, CUSTOMER_EMAIL, PASSWORD);
    }

    @Test
    void createPaymentAndConfirmUpdatesReservationToConfirmed() throws Exception {
        String reservationResponse = mockMvc.perform(post("/api/reservations")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 1,
                                  "vehicleId": 4,
                                  "startDate": "2026-07-10",
                                  "endDate": "2026-07-13"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        int reservationId = objectMapper.readTree(reservationResponse).get("id").asInt();

        String paymentResponse = mockMvc.perform(post("/api/reservations/" + reservationId + "/payment")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode payment = objectMapper.readTree(paymentResponse);
        String providerTransactionId = payment.get("providerTransactionId").asText();

        mockMvc.perform(post("/api/payments/" + providerTransactionId + "/confirm")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        mockMvc.perform(get("/api/reservations/user/1")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + reservationId + ")].status").value("CONFIRMED"));
    }
}
