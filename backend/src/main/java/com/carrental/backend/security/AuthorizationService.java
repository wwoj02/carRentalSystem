package com.carrental.backend.security;

import com.carrental.backend.user.User;
import com.carrental.backend.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthorizationService {

    public User requireAuthenticatedUser() {
        User user = UserContext.get();
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }
        return user;
    }

    public void requireAdmin() {
        User user = requireAuthenticatedUser();
        if (user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin access required"
            );
        }
    }

    public void requireSelfOrAdmin(Integer userId) {
        User user = requireAuthenticatedUser();
        if (user.getRole() != UserRole.ADMIN && !user.getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied"
            );
        }
    }
}
