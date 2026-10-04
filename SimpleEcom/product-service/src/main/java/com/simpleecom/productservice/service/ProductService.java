package com.simpleecom.productservice.service;

import com.simpleecom.productservice.dto.StockReductionRequest;
import com.simpleecom.productservice.model.Product;
import com.simpleecom.productservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    public ProductService(ProductRepository productRepository, RestTemplate restTemplate) {
        this.productRepository = productRepository;
        this.restTemplate = restTemplate;
    }

    private static final String USER_SERVICE_URL = "http://localhost:8081/api/user/internal/usernames";

    public Product addProduct(Product product) {
        // Deduplication check: prevent duplicate products from rapid double clicks
        if (product.getName() != null && product.getAdminUsername() != null) {
            Optional<Product> existingOpt = productRepository.findFirstByNameIgnoreCaseAndAdminUsername(
                product.getName().trim(), product.getAdminUsername().trim()
            );
            if (existingOpt.isPresent()) {
                Product existing = existingOpt.get();
                boolean sameCategory = (product.getCategory() == null && existing.getCategory() == null) ||
                        (product.getCategory() != null && product.getCategory().equalsIgnoreCase(existing.getCategory()));
                if (sameCategory && Math.abs(product.getPrice() - existing.getPrice()) < 0.01) {
                    log.warn("Duplicate product submission detected for '{}' by admin '{}'. Returning existing product id={}",
                            product.getName(), product.getAdminUsername(), existing.getId());
                    return existing;
                }
            }
        }

        if (product.getId() == null) {
            product.setId(generateNextProductId());
        }
        return productRepository.save(product);
    }

    private Long generateNextProductId() {
        for (long id = 1000; id <= 9999; id++) {
            if (!productRepository.existsById(id)) {
                return id;
            }
        }
        throw new RuntimeException("No available product IDs in range 1000-9999");
    }

    public Product updateProduct(Long id, Product product) {
        if (id == null) {
            throw new IllegalArgumentException("Product id cannot be null");
        }
        Optional<Product> existingProductOpt = productRepository.findById(id);
        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setCategory(product.getCategory());
            existingProduct.setImageUrl(product.getImageUrl());
            if (product.getAdminUsername() != null && !product.getAdminUsername().trim().isEmpty()
                    && !"admin".equals(product.getAdminUsername())) {
                existingProduct.setAdminUsername(product.getAdminUsername());
            }
            return productRepository.save(existingProduct);
        } else {
            throw new RuntimeException("Product not found with id " + id);
        }
    }

    public void deleteProduct(Long id) {
        if (id != null) {
            productRepository.deleteById(id);
        }
    }

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        Set<String> validUsernames = getValidUsernames();
        if (validUsernames.isEmpty()) {
            return products; // if user-service is down or circuit open, return all products
        }
        return products.stream()
                .filter(p -> p.getAdminUsername() == null || validUsernames.contains(p.getAdminUsername()))
                .collect(Collectors.toList());
    }

    public Set<String> getValidUsernames() {
        try {
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    USER_SERVICE_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<String>>() {
                    });
            if (response != null) {
                List<String> body = response.getBody();
                if (body != null) {
                    return new HashSet<>(body);
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch valid usernames from user-service: {}", e.getMessage());
        }
        return Collections.emptySet();
    }

    // Fallback method executed when user-service is down, timing out, or circuit is
    // OPEN
    public Set<String> getValidUsernamesFallback(Throwable t) {
        log.warn("CircuitBreaker fallback triggered: Could not reach user-service. Reason: {}", t.getMessage());
        return Collections.emptySet();
    }

    public Product getProductById(Long id) {
        if (id == null) {
            return null;
        }
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> getProductsByAdminUsername(String adminUsername) {
        if (adminUsername == null || adminUsername.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return productRepository.findByAdminUsernameIgnoreCase(adminUsername.trim());
    }

    public void reduceStock(List<StockReductionRequest> items) {
        if (items == null || items.isEmpty()) {
            return;
        }
        for (StockReductionRequest item : items) {
            if (item.getProductId() != null && item.getQuantity() > 0) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    int updatedQuantity = Math.max(0, product.getQuantity() - item.getQuantity());
                    product.setQuantity(updatedQuantity);
                    productRepository.save(product);
                    log.info("Reduced stock for product id={} ({}) to {}", product.getId(), product.getName(), updatedQuantity);
                }
            }
        }
    }

    public void revertStock(List<StockReductionRequest> items) {
        if (items == null || items.isEmpty()) {
            return;
        }
        for (StockReductionRequest item : items) {
            if (item.getProductId() != null && item.getQuantity() > 0) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    int updatedQuantity = product.getQuantity() + item.getQuantity();
                    product.setQuantity(updatedQuantity);
                    productRepository.save(product);
                    log.info("Reverted stock for product id={} ({}) to {}", product.getId(), product.getName(), updatedQuantity);
                }
            }
        }
    }
}
