package com.simpleecom.orderservice.controller;

import com.simpleecom.orderservice.model.Order;
import com.simpleecom.orderservice.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Order Service is running");
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody Order order,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerKey) {
        try {
            // Hybrid pattern: Use HTTP header if provided, otherwise use JSON body property
            if (headerKey != null && !headerKey.trim().isEmpty()) {
                order.setIdempotencyKey(headerKey.trim());
            }

            log.info("Processing order for customer={}, idempotencyKey={}",
                    order.getCustomerName(), order.getIdempotencyKey());
            Order savedOrder = orderService.createOrder(order);
            log.info("Order processed successfully with id={}, totalAmount={}", savedOrder.getId(), savedOrder.getTotal());
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            log.error("Error creating order for customer {}: {}", order.getCustomerName(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            log.debug("Fetched {} orders", orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting all orders: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Order>> getOrdersByUsername(@PathVariable String username) {
        try {
            List<Order> orders = orderService.getOrdersByUsername(username);
            log.debug("Fetched {} orders for user {}", orders.size(), username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting orders for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/{adminUsername}")
    public ResponseEntity<List<Order>> getOrdersByAdmin(@PathVariable String adminUsername) {
        try {
            List<Order> orders = orderService.getOrdersByAdminUsername(adminUsername);
            log.debug("Fetched {} orders for admin {}", orders.size(), adminUsername);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error getting orders for admin {}: {}", adminUsername, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if (status == null || status.trim().isEmpty()) {
                log.warn("Update order status rejected for order id={}: Status is required", id);
                return ResponseEntity.badRequest().body("Status is required");
            }
            log.info("Updating order id={} to status={}", id, status);
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("Error updating order status for id={}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok("Order deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
