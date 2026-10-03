package com.simpleecom.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/userService")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "User Service is currently experiencing high load or is down. Please try again later.");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/productService")
    public ResponseEntity<Map<String, Object>> productServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "Product Service is currently experiencing high load or is down. Please try again later.");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/cartService")
    public ResponseEntity<Map<String, Object>> cartServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "Cart Service is currently experiencing high load or is down. Please try again later.");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    /**
     * Fallback for Order Service — was missing in the original code.
     * Circuit breaker was configured for orderServiceCircuitBreaker in application.yml
     * but had no fallback endpoint.
     */
    @RequestMapping("/orderService")
    public ResponseEntity<Map<String, Object>> orderServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "Order Service is currently experiencing high load or is down. Please try again later.");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
