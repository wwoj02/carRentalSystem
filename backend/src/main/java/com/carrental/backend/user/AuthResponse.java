package com.carrental.backend.user;

public record AuthResponse(
        UserResponse user,
        String token
) {
}
