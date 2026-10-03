package com.simpleecom.userservice.controller;

import com.simpleecom.userservice.model.User;
import com.simpleecom.userservice.repository.UserRepository;
import com.simpleecom.userservice.service.UserDetailsImpl;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/internal/usernames")
    public ResponseEntity<List<String>> getAllUsernames() {
        List<String> usernames = userRepository.findAll().stream()
                .filter(java.util.Objects::nonNull)
                .map(user -> user.getUsername())
                .collect(Collectors.toList());
        return ResponseEntity.ok(usernames);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPERADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Return user profile details
        java.util.Collection<String> roles = userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(new UserProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getSpecializations(),
                roles
        ));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPERADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody UpdateProfileRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail().trim())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use by another account"));
            }
            user.setEmail(request.getEmail().trim());
        }

        user.setFirstName(request.getFirstName() != null && !request.getFirstName().trim().isEmpty() ? request.getFirstName().trim() : null);
        user.setLastName(request.getLastName() != null && !request.getLastName().trim().isEmpty() ? request.getLastName().trim() : null);
        user.setPhone(request.getPhone() != null && !request.getPhone().trim().isEmpty() ? request.getPhone().trim() : null);
        if (request.getSpecializations() != null) {
            user.setSpecializations(request.getSpecializations().trim());
        }

        userRepository.save(user);

        java.util.Collection<String> roles = userDetails.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(new UserProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getSpecializations(),
                roles
        ));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPERADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody ChangePasswordRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getCurrentPassword() == null || request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password and new password are required"));
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        if (request.getNewPassword().trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters long"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRoles().stream()
                                .map(role -> role.getName().replace("ROLE_", ""))
                                .collect(Collectors.toList()),
                        user.isEnabled(),
                        user.getSpecializations()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    public ResponseEntity<?> toggleUser(@NonNull @PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    public ResponseEntity<?> deleteUser(@NonNull @PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // DTO classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileResponse {
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String specializations;
        private java.util.Collection<String> roles;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String specializations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private List<String> roles;
        private boolean enabled;
        private String specializations;
    }
}

