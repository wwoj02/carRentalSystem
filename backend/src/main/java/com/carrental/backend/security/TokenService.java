package com.carrental.backend.security;

import com.carrental.backend.user.User;
import com.carrental.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class TokenService {
    private static final String SECRET = "car-rental-dev-secret-change-before-production";
    private static final long TOKEN_TTL_SECONDS = 24 * 60 * 60;

    private final UserRepository userRepository;

    public String createToken(User user) {
        long expiresAt = Instant.now().getEpochSecond() + TOKEN_TTL_SECONDS;
        String payload = user.getId() + ":" + user.getRole() + ":" + expiresAt;
        return base64(payload) + "." + sign(payload);
    }

    public User parseToken(String token) {
        if (token == null || !token.contains(".")) {
            throw unauthorized();
        }

        String[] parts = token.split("\\.", 2);
        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);

        if (!sign(payload).equals(parts[1])) {
            throw unauthorized();
        }

        String[] payloadParts = payload.split(":");
        if (payloadParts.length != 3) {
            throw unauthorized();
        }

        long expiresAt = Long.parseLong(payloadParts[2]);
        if (Instant.now().getEpochSecond() > expiresAt) {
            throw unauthorized();
        }

        Integer userId = Integer.valueOf(payloadParts[0]);
        return userRepository.findById(userId).orElseThrow(this::unauthorized);
    }

    private String base64(String value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign token", ex);
        }
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
    }
}
