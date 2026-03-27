package com.carrental.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password1 = "Samborn0607";
        String password2 = "Divya@2005";
        
        System.out.println("Password: " + password1);
        System.out.println("Hash: " + encoder.encode(password1));
        System.out.println();
        System.out.println("Password: " + password2);
        System.out.println("Hash: " + encoder.encode(password2));
    }
}
