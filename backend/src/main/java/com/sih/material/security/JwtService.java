package com.sih.material.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expiration;
    private final String issuer;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration,
            @Value("${jwt.issuer:sih-harmonization-backend}") String issuer) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // HS256 requires at least 256 bits. Fail fast instead of silently weakening
        // a misconfigured production secret.
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must contain at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expiration;
        this.issuer = issuer;
    }

    public String generateToken(SecurityUser securityUser) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("employeeId", securityUser.getEmployeeId());
        extraClaims.put("role", securityUser.getRole());
        extraClaims.put("userId", securityUser.getId());
        if (securityUser.getCpseId() != null) {
            extraClaims.put("cpseId", securityUser.getCpseId());
        }
        return buildToken(extraClaims, securityUser.getUsername(), expiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuer(issuer)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expiration))
                .signWith(key)
                .compact();
    }

    public boolean isTokenValid(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username != null && username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isTokenValid(String token, SecurityUser securityUser) {
        return isTokenValid(token, (org.springframework.security.core.userdetails.UserDetails) securityUser);
    }

    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmployeeId(String token) {
        return extractAllClaims(token).get("employeeId", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        Number num = extractAllClaims(token).get("userId", Number.class);
        return num != null ? num.longValue() : null;
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public long getExpirationTime() {
        return expiration / 1000; // in seconds
    }
}
