package com.simpleecom.userservice.config;

import com.simpleecom.userservice.model.Role;
import com.simpleecom.userservice.model.User;
import com.simpleecom.userservice.repository.RoleRepository;
import com.simpleecom.userservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${superadmin.username}")
    private String superadminUsername;

    @Value("${superadmin.email}")
    private String superadminEmail;

    @Value("${superadmin.password}")
    private String superadminPassword;

    public RoleDataInitializer(RoleRepository roleRepository,
                               UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        for (String roleName : Arrays.asList("ROLE_USER", "ROLE_ADMIN", "ROLE_SUPERADMIN")) {
            if (!roleRepository.findByName(roleName).isPresent()) {
                roleRepository.save(new Role(roleName));
                log.info("Initialized role: {}", roleName);
            }
        }

        if (!userRepository.existsByUsername(superadminUsername)) {
            Role superAdminRole = roleRepository.findByName("ROLE_SUPERADMIN").get();
            User superAdmin = new User(superadminUsername, superadminEmail, passwordEncoder.encode(superadminPassword));
            superAdmin.getRoles().add(superAdminRole);
            superAdmin.setEnabled(true);
            userRepository.save(superAdmin);
            log.info("SuperAdmin user created: username={}", superadminUsername);
        }
    }
}
