package com.simpleecom.productservice.controller;

import com.simpleecom.productservice.model.Product;
import com.simpleecom.productservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            log.info("Adding new product: name={}, price={}", product.getName(), product.getPrice());
            Product savedProduct = productService.addProduct(product);
            log.info("Product saved successfully: id={}, name={}", savedProduct.getId(), savedProduct.getName());
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            log.error("Error adding product {}: {}", product.getName(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            log.info("Updating product id={}: name={}", id, product.getName());
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            log.error("Error updating product id={}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            log.info("Deleting product id={}", id);
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting product id={}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            log.debug("Fetched {} products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error fetching all products: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Product Service is running");
    }

    @PostMapping("/test")
    public ResponseEntity<?> testAdd(@RequestBody Product product) {
        log.info("Test endpoint called with product: name={}", product.getName());
        return ResponseEntity.ok("Test successful: " + product.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/admin/{adminUsername}")
    public ResponseEntity<List<Product>> getProductsByAdminUsername(@PathVariable String adminUsername) {
        try {
            List<Product> products = productService.getProductsByAdminUsername(adminUsername);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/reduce-stock")
    public ResponseEntity<?> reduceStock(@RequestBody List<com.simpleecom.productservice.dto.StockReductionRequest> items) {
        try {
            log.info("Stock reduction requested for {} items", items != null ? items.size() : 0);
            productService.reduceStock(items);
            return ResponseEntity.ok("Stock reduced successfully");
        } catch (Exception e) {
            log.error("Error reducing stock: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/revert-stock")
    public ResponseEntity<?> revertStock(@RequestBody List<com.simpleecom.productservice.dto.StockReductionRequest> items) {
        try {
            log.info("Stock revert requested for {} items", items != null ? items.size() : 0);
            productService.revertStock(items);
            return ResponseEntity.ok("Stock reverted successfully");
        } catch (Exception e) {
            log.error("Error reverting stock: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
