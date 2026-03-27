package com.carrental;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Admin password: Samborn0607
        String adminPassword = "Samborn0607";
        String adminHash = encoder.encode(adminPassword);
        System.out.println("Admin Password Hash:");
        System.out.println(adminHash);
        System.out.println();
        
        // Customer password: Divya@2005
        String customerPassword = "Divya@2005";
        String customerHash = encoder.encode(customerPassword);
        System.out.println("Customer Password Hash:");
        System.out.println(customerHash);
    }
}