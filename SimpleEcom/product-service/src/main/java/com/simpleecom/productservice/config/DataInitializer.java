package com.simpleecom.productservice.config;

import com.simpleecom.productservice.model.Product;
import com.simpleecom.productservice.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            long count = productRepository.count();
            System.out.println("Current product count: " + count);

            if (count == 0) {
                System.out.println("Adding sample products...");
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
                System.out.println("Sample products added successfully!");
            } else {
                System.out.println("Products already exist, skipping initialization.");
            }
        } catch (Exception e) {
            System.err.println("Error initializing data: " + e.getMessage());
            e.printStackTrace();
        }
    }
}