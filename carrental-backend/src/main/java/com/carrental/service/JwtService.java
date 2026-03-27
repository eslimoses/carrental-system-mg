package com.carrental.service;

import com.carrental.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().toString());
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        try {
            // First try strict Base64 decode (Standard)
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            // Fallback for custom secrets (UUIDs, plain text) that fail Base64 decoding
            byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            
            // HS256 requires a key of at least 256 bits (32 bytes). 
            // If the custom secret is too short, we hash it to guarantee a 256-bit secure key.
            if (keyBytes.length < 32) {
                try {
                    java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                    keyBytes = digest.digest(keyBytes);
                } catch (Exception ex) {
                    throw new RuntimeException("Failed to generate secure fallback JWT key", ex);
                }
            }
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
}
