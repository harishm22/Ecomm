package com.simpleecom.productservice.controller;

import com.simpleecom.productservice.model.Product;
import com.simpleecom.productservice.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            System.out.println("Adding product: " + product.getName());
            Product savedProduct = productService.addProduct(product);
            System.out.println("Product saved with ID: " + savedProduct.getId());
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            System.err.println("Error adding product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            System.out.println("Found " + products.size() + " products");
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            System.err.println("Error getting products: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Product Service is running");
    }

    @PostMapping("/test")
    public ResponseEntity<?> testAdd(@RequestBody Product product) {
        System.out.println("Test endpoint called with product: " + product.getName());
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
            productService.reduceStock(items);
            return ResponseEntity.ok("Stock reduced successfully");
        } catch (Exception e) {
            System.err.println("Error reducing stock: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/revert-stock")
    public ResponseEntity<?> revertStock(@RequestBody List<com.simpleecom.productservice.dto.StockReductionRequest> items) {
        try {
            productService.revertStock(items);
            return ResponseEntity.ok("Stock reverted successfully");
        } catch (Exception e) {
            System.err.println("Error reverting stock: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
