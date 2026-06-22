package com.carrental.backend;

import com.carrental.backend.user.AuthResponse;
import com.carrental.backend.user.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class IntegrationTestSupport {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private IntegrationTestSupport() {
    }

    public static String obtainToken(MockMvc mockMvc, String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(OBJECT_MAPPER.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = OBJECT_MAPPER.readValue(response, AuthResponse.class);
        return authResponse.token();
    }

    public static ObjectMapper objectMapper() {
        return OBJECT_MAPPER;
    }
}
