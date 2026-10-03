package com.simpleecom.userservice;

import com.simpleecom.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

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
                    System.out.println("Enabled user: " + user.getUsername());
                }
            });
        };
    }
}
