package com.simpleecom.orderservice.repository;

import com.simpleecom.orderservice.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsernameOrderByOrderDateDesc(String username);
    List<Order> findAllByOrderByOrderDateDesc();

    // Find orders containing items that belong to a specific admin
    // Spring Data JPA generates: SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.adminUsername = ?1
    List<Order> findDistinctByItems_AdminUsernameOrderByOrderDateDesc(String adminUsername);

    // Idempotency lookup: check if an order has already been created with this key
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
}
