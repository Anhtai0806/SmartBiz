package com.smartbiz.backend.util;

import com.smartbiz.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret:smartbiz-secret-key-for-jwt-token-generation-and-validation-2024}")
    private String jwtSecret;

    @Value("${jwt.static-token.email:}")
    private String staticTokenEmail;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate JWT token with userId and role claims
     * 
     * @param user User entity containing id, email, and role
     * @return JWT token string
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("userId", user.getId().toString()); // Store UUID as string
        claims.put("role", user.getRole().name());
        return createToken(claims, user.getEmail(), shouldGenerateStaticToken(user.getEmail()));
    }

    /**
     * Generate JWT token from UserDetails (backward compatibility)
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new LinkedHashMap<>();
        // If UserDetails is actually a User entity, extract id and role
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            claims.put("userId", user.getId().toString()); // Store UUID as string
            claims.put("role", user.getRole().name());
        }
        return createToken(claims, userDetails.getUsername(), shouldGenerateStaticToken(userDetails.getUsername()));
    }

    public String generateToken(UserDetails userDetails, Map<String, Object> additionalClaims) {
        Map<String, Object> claims = new LinkedHashMap<>(additionalClaims);
        return createToken(claims, userDetails.getUsername(), shouldGenerateStaticToken(userDetails.getUsername()));
    }

    private String createToken(Map<String, Object> claims, String subject, boolean staticToken) {
        var builder = Jwts.builder()
                .claims(claims)
                .subject(subject)
                .signWith(getSigningKey());

        if (!staticToken) {
            builder.issuedAt(new java.util.Date());
        }

        return builder.compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract userId from JWT token
     * 
     * @param token JWT token string
     * @return userId as UUID
     */
    public UUID extractUserId(String token) {
        String userIdStr = extractClaim(token, claims -> claims.get("userId", String.class));
        return userIdStr != null ? UUID.fromString(userIdStr) : null;
    }

    /**
     * Extract role from JWT token
     * 
     * @param token JWT token string
     * @return role as String
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername());
    }

    private boolean shouldGenerateStaticToken(String subject) {
        if (subject == null || subject.isBlank()) {
            return false;
        }

        String normalizedSubject = subject.trim().toLowerCase(Locale.ROOT);
        String normalizedStaticTokenEmail = staticTokenEmail == null
                ? ""
                : staticTokenEmail.trim().toLowerCase(Locale.ROOT);

        return !normalizedStaticTokenEmail.isBlank()
                && Objects.equals(normalizedStaticTokenEmail, normalizedSubject);
    }
}
