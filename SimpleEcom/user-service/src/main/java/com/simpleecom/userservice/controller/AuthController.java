package com.simpleecom.userservice.controller;

import com.simpleecom.userservice.exception.ErrorResponse;
import com.simpleecom.userservice.model.Role;
import com.simpleecom.userservice.model.User;
import com.simpleecom.userservice.repository.RoleRepository;
import com.simpleecom.userservice.repository.UserRepository;
import com.simpleecom.userservice.security.JwtUtil;
import com.simpleecom.userservice.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Auth service is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody com.simpleecom.userservice.payload.RegistrationRequest signUpRequest) {
        try {
            System.out.println(
                    "[DEBUG] Register request: " + signUpRequest.getUsername() + " / " + signUpRequest.getEmail());
            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Error: Username is already taken!"));
            }
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Error: Email is already in use!"));
            }

            // Creating New User
            User user = new User(signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    passwordEncoder.encode(signUpRequest.getPassword()));

            Set<String> strRoles = signUpRequest.getRoles();
            Set<Role> roles = new HashSet<>();

            if (strRoles == null || strRoles.isEmpty()) {
                Role userRole = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);
            } else {
                for (String role : strRoles) {
                    switch (role.toUpperCase()) {
                        case "ADMIN":
                        case "ROLE_ADMIN":
                            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(adminRole);
                            break;
                        default:
                            Role userRole = roleRepository.findByName("ROLE_USER")
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(userRole);
                            break;
                    }
                }
            }

            user.setRoles(roles);
            user.setEnabled(true);
            userRepository.save(user);
            System.out.println("[DEBUG] User saved: " + user.getUsername());
            return ResponseEntity.ok(new ErrorResponse("User registered successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getUsername(), userDetails.getAuthorities()));
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public String getPassword() {
            return password;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // JwtResponse class for login response
    public static class JwtResponse {
        private String token;
        private String username;
        private Object roles;

        public JwtResponse(String token, String username, Object roles) {
            this.token = token;
            this.username = username;
            this.roles = roles;
        }

        public String getToken() {
            return token;
        }

        public String getUsername() {
            return username;
        }

        public Object getRoles() {
            return roles;
        }
    }
}
