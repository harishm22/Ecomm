package com.simpleecom.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.Objects;
import java.util.Optional;

/**
 * Configuration for rate limiting key resolution.
 *
 * Defines HOW we identify "who" is making a request:
 * - ipKeyResolver: uses client IP address (for unauthenticated routes like /api/auth/**)
 * - userKeyResolver: extracts username from JWT token (for authenticated routes)
 *
 * These beans are referenced in application.yml via SpEL: "#{@ipKeyResolver}"
 */
@Configuration
public class RateLimiterConfig {

    /**
     * Rate limit by client IP address.
     * Used for unauthenticated endpoints (login, register) where we don't have a user identity.
     *
     * Checks X-Forwarded-For header first (if behind a proxy/load balancer),
     * then falls back to the direct remote address.
     */
    @Bean
    @Primary
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            // X-Forwarded-For is set by reverse proxies/load balancers with the real client IP
            String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            String ip;
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
                // The first one is the real client IP
                ip = forwardedFor.split(",")[0].trim();
            } else {
                ip = Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                        .getAddress().getHostAddress();
            }
            return Mono.just("rate_ip:" + ip);
        };
    }

    /**
     * Rate limit by authenticated user (JWT username).
     * Used for authenticated endpoints (orders, products, cart) where we have a JWT token.
     *
     * Decodes the JWT payload (Base64) to extract the "sub" (subject/username) claim.
     * NOTE: This does NOT validate the JWT signature — that's done by downstream services.
     * We only need the username here to create a rate limit bucket per user.
     *
     * Falls back to IP-based limiting if no valid JWT is present.
     */
    @Bean("userKeyResolver")
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = extractUsernameFromJwt(token);
                if (username != null && !username.isEmpty()) {
                    return Mono.just("rate_user:" + username);
                }
            }
            // Fallback to IP if no JWT token present
            String ip = Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                    .getAddress().getHostAddress();
            return Mono.just("rate_ip:" + ip);
        };
    }

    /**
     * Extracts the username (sub claim) from a JWT token WITHOUT full validation.
     *
     * JWT structure: header.payload.signature (Base64-encoded parts separated by dots)
     * We decode the payload part and look for the "sub" field.
     *
     * Why not full validation? The gateway doesn't (and shouldn't) know the JWT secret.
     * Each downstream service validates the JWT fully. Here we just need the username
     * to create a per-user rate limit bucket.
     */
    private String extractUsernameFromJwt(String token) {
        try {
            // JWT has 3 parts: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            // Decode the payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));

            // Simple JSON parsing to find "sub" field
            // JWT payload looks like: {"sub":"username","iat":1234567890,"exp":1234567890}
            int subIndex = payload.indexOf("\"sub\"");
            if (subIndex == -1) {
                return null;
            }
            // Find the value after "sub":
            int colonIndex = payload.indexOf(":", subIndex);
            int firstQuote = payload.indexOf("\"", colonIndex + 1);
            int secondQuote = payload.indexOf("\"", firstQuote + 1);
            if (firstQuote != -1 && secondQuote != -1) {
                return payload.substring(firstQuote + 1, secondQuote);
            }
        } catch (Exception e) {
            // If JWT parsing fails, return null → fallback to IP-based rate limiting
            System.err.println("[RateLimiter] Could not extract username from JWT: " + e.getMessage());
        }
        return null;
    }
}
