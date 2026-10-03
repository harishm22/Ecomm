package com.simpleecom.orderservice.service;

import com.simpleecom.orderservice.model.Order;
import com.simpleecom.orderservice.model.OrderItem;
import com.simpleecom.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(Order order) {
        String key = order.getIdempotencyKey();
        if (key != null && !key.trim().isEmpty()) {
            key = key.trim();
            order.setIdempotencyKey(key);
            Optional<Order> existing = orderRepository.findByIdempotencyKey(key);
            if (existing.isPresent()) {
                System.out.println("[OrderService] Idempotency match: Order already created with key: " + key + ". Returning existing order #" + existing.get().getId());
                return existing.get();
            }
        }

        if (order.getOrderDate() == null) {
            order.setOrderDate(new Date());
        }
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("pending");
        }
        
        // Ensure bidirectional relationship for cascade save
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }
        
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public List<Order> getOrdersByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return orderRepository.findAllByOrderByOrderDateDesc();
        }
        return orderRepository.findByUsernameOrderByOrderDateDesc(username.trim());
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByAdminUsername(String adminUsername) {
        if (adminUsername == null || adminUsername.trim().isEmpty()) {
            return orderRepository.findAllByOrderByOrderDateDesc();
        }
        return orderRepository.findDistinctByItems_AdminUsernameOrderByOrderDateDesc(adminUsername.trim());
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String normalized = status.toLowerCase().trim();
            if (normalized.equals(order.getStatus())) {
                return order;
            }
            order.setStatus(normalized);
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found with id: " + orderId);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
