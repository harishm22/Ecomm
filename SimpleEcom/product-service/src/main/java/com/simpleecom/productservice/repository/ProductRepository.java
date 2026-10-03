package com.simpleecom.productservice.repository;

import com.simpleecom.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAdminUsername(String adminUsername);

    List<Product> findByAdminUsernameIgnoreCase(String adminUsername);

    Optional<Product> findFirstByNameIgnoreCaseAndAdminUsername(String name, String adminUsername);
}
