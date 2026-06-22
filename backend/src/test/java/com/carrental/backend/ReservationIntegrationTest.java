package com.carrental.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReservationIntegrationTest {

    private static final String CUSTOMER_EMAIL = "john.smith@example.com";
    private static final String PASSWORD = "password";

    @Autowired
    private MockMvc mockMvc;

    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        customerToken = IntegrationTestSupport.obtainToken(mockMvc, CUSTOMER_EMAIL, PASSWORD);
    }

    @Test
    void overlapBookingIsRejected() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 1,
                                  "vehicleId": 1,
                                  "startDate": "2026-06-21",
                                  "endDate": "2026-06-25"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vehicle is already reserved in this period"));
    }

    @Test
    void createReservationForAvailableVehicleSucceeds() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": 1,
                                  "vehicleId": 4,
                                  "startDate": "2026-07-01",
                                  "endDate": "2026-07-05"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.vehicle.id").value(4));
    }
}
