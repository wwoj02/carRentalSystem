package com.carrental.backend.security;

import com.carrental.backend.user.User;
import com.carrental.backend.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return user;
    }

    public static boolean isStaff(User user) {
        return user.getRole() == UserRole.EMPLOYEE || user.getRole() == UserRole.ADMIN;
    }

    public static void requireOwnerOrStaff(Integer ownerUserId) {
        User current = getCurrentUser();
        if (!isStaff(current) && !current.getId().equals(ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    public static void requireStaff() {
        if (!isStaff(getCurrentUser())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
