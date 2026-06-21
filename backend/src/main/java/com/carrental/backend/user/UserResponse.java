package com.carrental.backend.user;

public record UserResponse(
        Integer id,
        String firstName,
        String lastName,
        String email,
        UserRole role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
