package com.simpleecom.userservice;

import com.simpleecom.userservice.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@Slf4j
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner enableAllUsers(UserRepository userRepository) {
        return args -> {
            userRepository.findAll().forEach(user -> {
                if (!user.isEnabled()) {
                    user.setEnabled(true);
                    userRepository.save(user);
                    log.info("Enabled user: {}", user.getUsername());
                }
            });
        };
    }
}
