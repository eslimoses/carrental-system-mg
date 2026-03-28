package com.carrental.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostic")
public class DiagnosticController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/test-email")
    public Map<String, Object> testEmail() {
        Map<String, Object> response = new HashMap<>();
        System.out.println("============== 🛠 [DIAGNOSTIC] EMAIL TEST STARTED ==============");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("eslimoses2005@gmail.com");
            message.setTo("eslimoses2005@gmail.com"); // Send to self
            message.setSubject("🛠 Car Rental Diagnostic - SMTP Test");
            message.setText("This is a synchronous test email to verify SMTP configuration.");

            System.out.println("🚀 Attempting to send message via JavaMailSender...");
            mailSender.send(message);

            System.out.println("✅ [DIAGNOSTIC] SUCCESS: Email sent successfully!");
            response.put("status", "SUCCESS");
            response.put("message", "Email sent successfully to eslimoses2005@gmail.com");
            return response;
        } catch (Exception e) {
            System.err.println("❌ [DIAGNOSTIC] FAILED: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "FAILED");
            response.put("error", e.getMessage());
            response.put("cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown");
            return response;
        } finally {
            System.out.println("=============================================================");
        }
    }
}
