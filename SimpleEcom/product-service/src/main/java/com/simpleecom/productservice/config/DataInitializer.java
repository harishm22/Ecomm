package com.simpleecom.productservice.config;

import com.simpleecom.productservice.model.Product;
import com.simpleecom.productservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            long count = productRepository.count();
            log.info("Current product count: {}", count);

            if (count == 0) {
                log.info("Adding sample products...");
                productRepository.save(new Product(1000L, "iPhone 14", "Latest Apple smartphone with advanced features",
                        999.99, 50, "admin", null, "Electronics"));
                productRepository.save(new Product(1001L, "Samsung Galaxy S23", "Premium Android smartphone", 899.99,
                        30, "admin", null, "Electronics"));
                productRepository.save(new Product(1002L, "Pizza Margherita",
                        "Classic Italian pizza with fresh ingredients", 12.99, 100, "admin", null, "Food"));
                productRepository.save(new Product(1003L, "Nike Air Max", "Comfortable running shoes", 129.99, 25,
                        "admin", null, "Clothing"));
                productRepository.save(new Product(1004L, "Java Programming Book", "Complete guide to Java programming",
                        49.99, 15, "admin", null, "Books"));
                productRepository.save(new Product(1005L, "Coffee Maker", "Automatic drip coffee maker", 79.99, 20,
                        "admin", null, "Home"));
                productRepository.save(new Product(1006L, "Football", "Professional quality football", 29.99, 40,
                        "admin", null, "Sports"));
                log.info("Sample products added successfully!");
            } else {
                log.info("Products already exist, skipping sample data initialization.");
            }
        } catch (Exception e) {
            log.error("Error initializing sample data: {}", e.getMessage(), e);
        }
    }
}