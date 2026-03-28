package com.carrental.service;

import com.carrental.entity.Booking;
import com.carrental.entity.User;
import com.carrental.repository.UserRepository;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.PaymentRepository;
import com.carrental.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.core.io.ByteArrayResource;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PdfGeneratorService pdfGeneratorService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.whatsapp.from:}")
    private String twilioWhatsappFrom;

    @PostConstruct
    public void initTwilio() {
        try {
            if (twilioAccountSid != null && !twilioAccountSid.isEmpty()) {
                Twilio.init(twilioAccountSid, twilioAuthToken);
            }
        } catch (Throwable t) {
            System.err.println("Critical failure initializing Twilio: " + t.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmation(Long bookingId) {
        System.out.println("[ASYNC] Started sendBookingConfirmation for ID: " + bookingId);
        try {
            // Wait for transaction to commit if necessary (up to 5 seconds)
            Booking booking = null;
            for (int i = 0; i < 10; i++) {
                booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) break;
                System.out.println("[ASYNC] Waiting for booking record " + bookingId + " to commit... attempt " + (i + 1));
                Thread.sleep(500);
            }

            if (booking == null) {
                System.err.println("[ASYNC-ERROR] Booking not found after multiple retries for ID: " + bookingId);
                return;
            }
            
            System.out.println("[ASYNC] Found booking " + booking.getBookingNumber() + ". Proceeding with confirmation email.");
            User customer = booking.getCustomer();
            com.carrental.entity.Vehicle vehicle = booking.getVehicle();

            String subject = "🚗 Booking Confirmed - " + booking.getBookingNumber() + " | MotoGlide";

            long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getPickupDate(), booking.getReturnDate());
            if (days < 1) days = 1;

            java.math.BigDecimal advanceDue = booking.getAdvanceAmount() != null ? booking.getAdvanceAmount()
                    : booking.getTotalAmount().divide(java.math.BigDecimal.valueOf(3), 2, java.math.RoundingMode.HALF_UP);
            java.math.BigDecimal remaining = booking.getTotalAmount().subtract(advanceDue);

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>"
                + "<div style='max-width:600px;margin:30px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);'>"
                // Header
                + "<div style='background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:35px 30px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:1px;font-weight:900;'>🚗 Booking Confirmed!</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:15px;'>Your premium car from MotoGlide is ready for you</p>"
                + "</div>"
                // Greeting
                + "<div style='padding:30px 30px 10px;'>"
                + "<p style='font-size:16px;color:#333;'>Hello <strong>" + customer.getFirstName() + "</strong>,</p>"
                + "<p style='color:#666;font-size:14px;'>Thank you for choosing MotoGlide. Here is your receipt:</p>"
                + "</div>"
                // Booking Details Section
                + "<div style='margin:0 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:linear-gradient(to right, #4f46e5, #4338ca);padding:14px 20px;'><p style='color:white;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>📋 BOOKING DETAILS</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;width:40%;'>Booking ID</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>#" + booking.getBookingNumber() + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Car</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + vehicle.getMake() + " " + vehicle.getModel() + " (" + vehicle.getYear() + ")</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Period</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + booking.getPickupDate() + " to " + booking.getReturnDate() + " (" + days + " day" + (days > 1 ? "s" : "") + ")</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Pickup Time</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + booking.getPickupTime() + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>City</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + (booking.getCity() != null ? booking.getCity().getName() : "N/A") + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Status</td><td style='padding:14px 20px;font-weight:900;color:#10b981;text-transform:uppercase;'>CONFIRMED ✓</td></tr>"
                + "</table></div>"
                // Payment Summary Section
                + "<div style='margin:25px 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:linear-gradient(to right, #10b981, #059669);padding:14px 20px;'><p style='color:white;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>💳 PAYMENT SUMMARY</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Total Amount</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>Rs." + String.format("%.2f", booking.getTotalAmount()) + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Advance Paid</td><td style='padding:14px 20px;font-weight:900;color:#10b981;'>Rs." + String.format("%.2f", advanceDue) + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Remaining Balance</td><td style='padding:14px 20px;font-weight:900;color:#e11d48;'>Rs." + String.format("%.2f", remaining) + "</td></tr>"
                + "</table></div>"
                // Footer Note
                + "<div style='padding:20px 30px;text-align:center;background:#f9f9f9;border-top:1px solid #eee;margin-top:20px;'>"
                + "<p style='color:#27ae60;font-size:16px;font-weight:bold;margin:0 0 8px;'>Thank you for riding with us! 🎉</p>"
                + "<p style='color:#999;font-size:12px;margin:0;'>For support, contact us at support@motoglide.com</p>"
                + "</div></div></body></html>";

            // Create a fake payment and bill for the invoice PDF (booking-level only)
            com.carrental.entity.Payment dummyAdvancePayment = new com.carrental.entity.Payment();
            dummyAdvancePayment.setAmount(advanceDue);
            dummyAdvancePayment.setPaymentType(com.carrental.entity.Payment.PaymentType.ADVANCE);
            dummyAdvancePayment.setTransactionId("PENDING");
            dummyAdvancePayment.setPaymentDate(java.time.LocalDateTime.now());
            dummyAdvancePayment.setStatus(com.carrental.entity.Payment.PaymentStatus.PENDING);

            System.out.println("[ASYNC] Attempting to send MimeMessage to: " + customer.getEmail());
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(booking, dummyAdvancePayment, null);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(customer.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml
            helper.addAttachment("Invoice-" + booking.getBookingNumber() + ".pdf", new ByteArrayResource(pdfBytes));
            mailSender.send(mimeMessage);
            System.out.println("[ASYNC] MimeMessage sent successfully.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Critical fail in sendBookingConfirmation: " + e.getMessage());
            e.printStackTrace();
        }
        sendBookingConfirmationWhatsApp(bookingId);
    }

    @Async
    public void sendPaymentReminder(Long bookingId) {
        System.out.println("[ASYNC] Starting sendPaymentReminder for ID: " + bookingId);
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) return;
            User customer = booking.getCustomer();

            String subject = "Payment Reminder - Car Rental System";
            String body = String.format(
                    "Dear %s,\n\nThis is a reminder to pay the remaining amount for your booking.\n" +
                    "Booking Number: %s\n" +
                    "Amount Due: Rs. %.2f\n" +
                    "Due Date: 10 days before rental\n\n" +
                    "Please complete the payment to confirm your booking.",
                    customer.getFirstName(),
                    booking.getBookingNumber(),
                    booking.getAdvanceAmount()
            );

            sendEmail(customer.getEmail(), subject, body);
            System.out.println("[ASYNC] Payment reminder email sent.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Error in sendPaymentReminder: " + e.getMessage());
        }
    }

    @Async
    public void sendBillEmail(Long billId) {
        System.out.println("[ASYNC] Starting sendBillEmail for ID: " + billId);
        try {
            com.carrental.entity.Bill bill = billRepository.findById(billId).orElse(null);
            if (bill == null) return;
            User customer = bill.getCustomer();

            String subject = "Bill Generated - Car Rental System";
            String body = String.format(
                    "Dear %s,\n\nYour rental bill has been generated.\n" +
                    "Bill Number: %s\n" +
                    "Total Amount: Rs. %.2f\n" +
                    "Amount Due: Rs. %.2f\n\n" +
                    "Please find the detailed bill attached.",
                    customer.getFirstName(),
                    bill.getBillNumber(),
                    bill.getTotalAmount(),
                    bill.getBalanceAmount()
            );

            sendEmail(customer.getEmail(), subject, body);
            System.out.println("[ASYNC] Bill email sent.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Error in sendBillEmail: " + e.getMessage());
        }
    }

    @Async
    public void sendPaymentConfirmationWithInvoice(Long bookingId, Long paymentId, Long billId) {
        System.out.println("[ASYNC] Started sendPaymentConfirmationWithInvoice for Booking: " + bookingId);
        try {
            // Wait for transaction to commit if necessary (up to 5 seconds)
            Booking booking = null;
            com.carrental.entity.Payment payment = null;
            com.carrental.entity.Bill bill = null;

            for (int i = 0; i < 10; i++) {
                booking = bookingRepository.findById(bookingId).orElse(null);
                payment = paymentId != null ? paymentRepository.findById(paymentId).orElse(null) : null;
                bill = billId != null ? billRepository.findById(billId).orElse(null) : null;

                // Check if the essential records (booking and payment) are found
                if (booking != null && (paymentId == null || payment != null)) break;
                
                System.out.println("[ASYNC] Waiting for records to commit... attempt " + (i + 1));
                Thread.sleep(500);
            }
            
            if (booking == null) {
                System.err.println("[ASYNC-ERROR] Booking not found after multiple retries for ID: " + bookingId);
                return;
            }
            if (paymentId != null && payment == null) {
                System.err.println("[ASYNC-ERROR] Payment not found after multiple retries for ID: " + paymentId);
                return;
            }
            
            User customer = booking.getCustomer();
            com.carrental.entity.Vehicle vehicle = booking.getVehicle();
            
            System.out.println("[ASYNC] Found records. Composing payment confirmation for: " + customer.getEmail());

            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>"
                + "<div style='max-width:600px;margin:30px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);'>"
                // Header
                + "<div style='background:linear-gradient(135deg,#10b981,#059669);padding:35px 30px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:1px;font-weight:900;'>✅ Payment Successful!</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:15px;'>Your booking #" + booking.getBookingNumber() + " is now confirmed</p>"
                + "</div>"
                // Greeting
                + "<div style='padding:30px 30px 10px;'>"
                + "<p style='font-size:16px;color:#333;'>Hello <strong>" + customer.getFirstName() + "</strong>,</p>"
                + "<p style='color:#666;font-size:14px;'>We have received your payment. Details of your transaction are below:</p>"
                + "</div>"
                // Payment Details Table
                + "<div style='margin:0 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:#f8fafc;padding:14px 20px;border-bottom:1px solid #e2e8f0;'><p style='color:#64748b;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>💳 TRANSACTION INFO</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Transaction ID</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + payment.getTransactionId() + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Amount Paid</td><td style='padding:14px 20px;font-weight:900;color:#10b981;'>Rs." + String.format("%.2f", payment.getAmount()) + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Method</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + payment.getPaymentMethod() + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Date</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + payment.getPaymentDate() + "</td></tr>"
                + "</table></div>"
                // Booking Summary
                + "<div style='margin:25px 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:#f8fafc;padding:14px 20px;border-bottom:1px solid #e2e8f0;'><p style='color:#64748b;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>📋 BOOKING SUMMARY</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Vehicle</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + vehicle.getMake() + " " + vehicle.getModel() + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Pickup</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + booking.getPickupDate() + " at " + booking.getPickupTime() + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Location</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + (booking.getCity() != null ? booking.getCity().getName() : "N/A") + "</td></tr>"
                + "</table></div>"
                // Footer
                + "<div style='padding:20px 30px;text-align:center;background:#f9f9f9;border-top:1px solid #eee;margin-top:20px;'>"
                + "<p style='color:#10b981;font-size:16px;font-weight:bold;margin:0 0 8px;'>Your car is ready for pickup! 🏁</p>"
                + "<p style='color:#999;font-size:12px;margin:0;'>Your invoice is attached to this email. For any help, contact support@motoglide.com</p>"
                + "</div></div></body></html>";

            String subject = "🚗 Payment Confirmed - Booking #" + booking.getBookingNumber() + " | MotoGlide";
            
            System.out.println("[ASYNC] Attempting to send MimeMessage with invoice...");
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(booking, payment, bill);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(customer.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            
            helper.addAttachment("Invoice-" + booking.getBookingNumber() + ".pdf", new ByteArrayResource(pdfBytes));
            mailSender.send(message);
            System.out.println("[ASYNC] Payment confirmation email sent.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Critical fail in sendPaymentConfirmationWithInvoice: " + e.getMessage());
            e.printStackTrace();
        }
        sendPaymentConfirmationWhatsApp(bookingId, paymentId, billId);
    }

    public void sendEmail(String to, String subject, String body) {
        System.out.println("[DEBUG] Sending simple email to: " + to + " with subject: " + subject);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("[DEBUG] Simple email sent successfully.");
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send simple email: " + e.getMessage());
        }
    }

    @Async
    public void sendBookingCancellation(Long bookingId) {
        System.out.println("[ASYNC] Started sendBookingCancellation for ID: " + bookingId);
        try {
            // Wait for transaction to commit if necessary (up to 5 seconds)
            Booking booking = null;
            for (int i = 0; i < 10; i++) {
                booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) break;
                System.out.println("[ASYNC] Waiting for cancellation record " + bookingId + " to commit... attempt " + (i + 1));
                Thread.sleep(500);
            }

            if (booking == null) {
                System.err.println("[ASYNC-ERROR] Booking not found after multiple retries for cancellation: " + bookingId);
                return;
            }
            User customer = booking.getCustomer();
            com.carrental.entity.Vehicle vehicle = booking.getVehicle();

            String subject = "🚫 Booking Cancelled - " + booking.getBookingNumber() + " | MotoGlide";

            java.math.BigDecimal advancePaid = booking.getAdvanceAmount() != null ? booking.getAdvanceAmount()
                    : booking.getTotalAmount().divide(java.math.BigDecimal.valueOf(3), 2, java.math.RoundingMode.HALF_UP);
            
            String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>"
                + "<div style='max-width:600px;margin:30px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);'>"
                // Header
                + "<div style='background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:35px 30px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:1px;font-weight:900;'>🚫 Booking Cancelled</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:15px;'>Your reservation has been cancelled successfully</p>"
                + "</div>"
                // Greeting
                + "<div style='padding:30px 30px 10px;'>"
                + "<p style='font-size:16px;color:#333;'>Hello <strong>" + customer.getFirstName() + "</strong>,</p>"
                + "<p style='color:#666;font-size:14px;'>As per your request, your booking has been cancelled. Details below:</p>"
                + "</div>"
                // Booking Details Section
                + "<div style='margin:0 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:linear-gradient(to right, #4f46e5, #4338ca);padding:14px 20px;'><p style='color:white;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>📋 BOOKING DETAILS</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;width:40%;'>Booking ID</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>#" + booking.getBookingNumber() + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Car</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + vehicle.getMake() + " " + vehicle.getModel() + " (" + vehicle.getYear() + ")</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Period</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + booking.getPickupDate() + " to " + booking.getReturnDate() + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>City</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>" + (booking.getCity() != null ? booking.getCity().getName() : "N/A") + "</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Status</td><td style='padding:14px 20px;font-weight:900;color:#e11d48;text-transform:uppercase;'>CANCELLED ✘</td></tr>"
                + "</table></div>"
                // Refund Summary Section
                + "<div style='margin:25px 30px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 6px rgba(0,0,0,0.02);'>"
                + "<div style='background:linear-gradient(to right, #10b981, #059669);padding:14px 20px;'><p style='color:white;margin:0;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'>💳 REFUND SUMMARY</p></div>"
                + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Refund Initiated</td><td style='padding:14px 20px;font-weight:900;color:#10b981;'>Rs." + String.format("%.2f", advancePaid) + "</td></tr>"
                + "<tr><td style='padding:14px 20px;color:#64748b;'>Handling Fee</td><td style='padding:14px 20px;font-weight:800;color:#1e293b;'>Rs. 0.00</td></tr>"
                + "<tr style='background:#fcfdff;'><td style='padding:14px 20px;color:#64748b;'>Final Settlement</td><td style='padding:14px 20px;font-weight:900;color:#10b981;'>Rs." + String.format("%.2f", advancePaid) + "</td></tr>"
                + "</table></div>"
                // Footer
                + "<div style='padding:20px 30px;text-align:center;background:#f9f9f9;border-top:1px solid #eee;'>"
                + "<p style='color:#999;font-size:12px;margin:0;'>For any queries, please reply to this email.</p>"
                + "<p style='color:#999;font-size:12px;margin:5px 0 0;'>MotoGlide - Premium Car Rentals</p></div></div></body></html>";

            System.out.println("[ASYNC] Attempting to send cancellation email to: " + customer.getEmail());
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(customer.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            System.out.println("[ASYNC] Cancellation email sent successfully.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Critical fail in sendBookingCancellation: " + e.getMessage());
            e.printStackTrace();
        }
        sendBookingCancellationWhatsApp(bookingId);
    }

    @Async
    public void sendBookingCompletion(Long bookingId) {
        System.out.println("[ASYNC] Starting sendBookingCompletion for ID: " + bookingId);
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) return;
            User customer = booking.getCustomer();
            String subject = "Rental Completed - Car Rental System";
            String body = String.format(
                    "Dear %s,\n\nYour rental for booking %s has been completed.\n" +
                    "Thank you for choosing MotoGlide!",
                    customer.getFirstName(),
                    booking.getBookingNumber()
            );
            sendEmail(customer.getEmail(), subject, body);
            System.out.println("[ASYNC] Rental completion email sent.");
        } catch (Throwable e) {
            System.err.println("[ASYNC-ERROR] Error in sendBookingCompletion: " + e.getMessage());
        }
    }

    public void sendBookingConfirmationWhatsApp(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) return;
        String message = String.format("🎉 Your booking %s is confirmed! View details at: https://carrental-system-mg.vercel.app/dashboard", 
                booking.getBookingNumber());
        sendWhatsAppMessage(booking.getCustomer().getPhoneNumber(), message);
    }

    public void sendPaymentConfirmationWhatsApp(Long bookingId, Long paymentId, Long billId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        com.carrental.entity.Payment payment = paymentId != null ? paymentRepository.findById(paymentId).orElse(null) : null;
        com.carrental.entity.Bill bill = billId != null ? billRepository.findById(billId).orElse(null) : null;
        if (booking == null || payment == null) return;
        
        StringBuilder sb = new StringBuilder();
        sb.append("✅ *PAYMENT CONFIRMED*\n");
        sb.append("Hi ").append(booking.getCustomer().getFirstName()).append(", your payment was successful!\n\n");
        sb.append("🧾 *BILL SUMMARY*\n");
        sb.append("Booking ID: ").append(booking.getBookingNumber()).append("\n");
        sb.append("Vehicle: ").append(booking.getVehicle().getMake()).append(" ").append(booking.getVehicle().getModel()).append("\n");
        sb.append("Amount Paid: Rs. ").append(payment.getAmount()).append("\n");
        if (payment.getAmount().compareTo(booking.getTotalAmount()) < 0) {
            sb.append("Remaining Balance Due: Rs. ").append(booking.getTotalAmount().subtract(payment.getAmount())).append("\n");
        }
        if (bill != null) {
            sb.append("Invoice No: ").append(bill.getBillNumber()).append("\n");
        }
        sb.append("\n");
        sb.append("🗓 *RENTAL PERIOD*\n");
        sb.append(booking.getPickupDate()).append(" to ").append(booking.getReturnDate()).append("\n\n");
        sb.append("A detailed PDF invoice has been sent to your email. ");
        sb.append("Thank you for choosing MotoGlide! Drive safe. 🚗");
        
        sendWhatsAppMessage(booking.getCustomer().getPhoneNumber(), sb.toString());
    }

    public void sendBookingCancellationWhatsApp(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) return;
        String message = String.format("❌ Your booking %s has been cancelled. Any advance amount will be refunded. Thank you, MotoGlide.", 
                booking.getBookingNumber());
        sendWhatsAppMessage(booking.getCustomer().getPhoneNumber(), message);
    }

    public void sendOtpEmail(String email, String otp) {
        String subject = "📧 Verify Your Account - MotoGlide OTP";
        
        String htmlBody = "<!DOCTYPE html><html>"
            + "<head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background-color:#f9fafb;font-family:\"Segoe UI\",Tahoma,Geneva,Verdana,sans-serif;'>"
            + "<div style='max-width:500px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e5e7eb;'>"
            // Gradient Header
            + "<div style='background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);padding:40px 20px;text-align:center;'>"
            + "<h1 style='color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;'>Email Verification</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:15px;'>Car Rental System</p>"
            + "</div>"
            // Content
            + "<div style='padding:40px 35px;'>"
            + "<p style='font-size:16px;color:#374151;line-height:1.6;margin-top:0;'>Hello,</p>"
            + "<p style='font-size:15px;color:#4b5563;line-height:1.6;'>Thank you for choosing <strong>MotoGlide</strong>! To complete your registration and secure your account, please use the verification code below:</p>"
            
            // OTP Box
            + "<div style='margin:35px 0;text-align:center;background:#f3f4f6;border-radius:12px;padding:30px;border:2px dashed #6366f1;'>"
            + "<span style='font-family:monospace;font-size:42px;font-weight:900;letter-spacing:12px;color:#4f46e5;text-shadow:1px 1px 0px #fff;'>" + otp + "</span>"
            + "</div>"
            
            + "<p style='font-size:14px;color:#6b7280;text-align:center;'>This OTP is valid for <strong>" + 5 + " minutes</strong>. For security, please do not share this code with anyone.</p>"
            + "</div>"
            
            // Footer
            + "<div style='padding:25px;background:#f9fafb;text-align:center;border-top:1px solid #f3f4f6;'>"
            + "<p style='margin:0;font-size:12px;color:#9ca3af;'>If you didn't request this, you can safely ignore this email.</p>"
            + "<p style='margin:10px 0 0;font-size:12px;color:#9ca3af;font-weight:bold;'>© 2026 MotoGlide Car Rental</p>"
            + "</div>"
            + "</div></body></html>";

        try {
            if (mailSender == null) {
                System.out.println("Mail sender not found. Skipping email verification step for: " + email);
                System.out.println("BYPASS: OTP is " + otp);
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Throwable e) {
            System.err.println("Failed to send OTP email (likely missing config): " + e.getMessage());
            System.out.println("NOTICE: Registration is continuing without email delivery.");
        }
    }

    public void sendWhatsAppMessage(String toPhoneNumber, String messageText) {
        System.out.println("[DEBUG] Attempting to send WhatsApp message to: " + toPhoneNumber);
        try {
            if (twilioAccountSid == null || twilioAccountSid.isEmpty()) {
                System.out.println("[DEBUG] Twilio SID is empty. Skipping WhatsApp.");
                return;
            }
            if (toPhoneNumber == null || toPhoneNumber.isEmpty()) {
                System.out.println("[DEBUG] Recipient phone number is empty. Skipping WhatsApp.");
                return;
            }
            
            // Ensure format is correct for WhatsApp
            String formattedTo = toPhoneNumber.startsWith("whatsapp:") ? toPhoneNumber : "whatsapp:" + toPhoneNumber;
            System.out.println("[DEBUG] Using Twilio to send to: " + formattedTo);
            
            Message.creator(
                new PhoneNumber(formattedTo),
                new PhoneNumber(twilioWhatsappFrom),
                messageText
            ).create();
            System.out.println("[DEBUG] WhatsApp message sent successfully to " + toPhoneNumber);
        } catch (Throwable t) {
            System.err.println("[ERROR] Failed to send WhatsApp message: " + t.getMessage());
            t.printStackTrace();
        }
    }
    /**
     * Send offer/promo code notification to one customer or all customers.
     * @param offer - the PromoCode entity
     * @param targetEmail - null means ALL customers; non-null means specific email
     */
    public void sendOfferNotification(com.carrental.entity.PromoCode offer, String targetEmail) {
        String subject = "🎉 Exclusive Offer Just for You! " + offer.getDiscountPercentage() + "% OFF | MotoGlide";

        String htmlBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
            + "<body style='margin:0;padding:0;background:#0f1629;font-family:Arial,sans-serif;'>"
            + "<div style='max-width:600px;margin:30px auto;background:#1a1c2e;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);border:1px solid rgba(212,165,116,0.3);'>"
            // Header
            + "<div style='background:linear-gradient(135deg,#d4a574,#b8860b);padding:40px 30px;text-align:center;'>"
            + "<h1 style='color:#1a1c2e;margin:0;font-size:28px;font-weight:900;letter-spacing:1px;'>🎁 SPECIAL OFFER FOR YOU!</h1>"
            + "<p style='color:rgba(26,28,46,0.8);margin:10px 0 0;font-size:15px;font-weight:bold;'>MotoGlide Premium Car Rental</p>"
            + "</div>"
            // Promo Code Box
            + "<div style='padding:35px 30px;text-align:center;'>"
            + "<p style='color:#d4a574;font-size:16px;font-weight:bold;margin:0 0 20px;'>Use code below and save on your next ride:</p>"
            + "<div style='background:rgba(212,165,116,0.1);border:2px dashed #d4a574;border-radius:16px;padding:25px;margin:0 auto 25px;max-width:300px;'>"
            + "<p style='color:#888;font-size:12px;font-weight:bold;margin:0 0 8px;text-transform:uppercase;letter-spacing:3px;'>Promo Code</p>"
            + "<p style='color:#d4a574;font-size:36px;font-weight:900;margin:0;letter-spacing:6px;font-family:monospace;'>" + offer.getCode() + "</p>"
            + "</div>"
            // Offer Details Table
            + "<div style='background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:25px;'>"
            + "<table style='width:100%;border-collapse:collapse;font-size:14px;'>"
            + "<tr>"
            + "<td style='padding:14px 20px;color:#888;border-bottom:1px solid rgba(255,255,255,0.05);'>Discount</td>"
            + "<td style='padding:14px 20px;font-weight:900;color:#22c55e;font-size:22px;border-bottom:1px solid rgba(255,255,255,0.05);'>" + offer.getDiscountPercentage() + "% OFF</td>"
            + "</tr>"
            + (offer.getMaxDiscountAmount() != null ? "<tr><td style='padding:14px 20px;color:#888;border-bottom:1px solid rgba(255,255,255,0.05);'>Max Savings</td><td style='padding:14px 20px;font-weight:800;color:#d4a574;border-bottom:1px solid rgba(255,255,255,0.05);'>Up to ₹" + offer.getMaxDiscountAmount() + "</td></tr>" : "")
            + (offer.getValidUntil() != null ? "<tr><td style='padding:14px 20px;color:#888;'>Valid Until</td><td style='padding:14px 20px;font-weight:800;color:#f87171;'>" + offer.getValidUntil().toLocalDate() + "</td></tr>" : "")
            + "</table></div>"
            + (offer.getDescription() != null && !offer.getDescription().isEmpty() ? "<p style='color:#aaa;font-size:13px;margin:0 0 25px;font-style:italic;'>\"" + offer.getDescription() + "\"</p>" : "")
            // CTA Button
            + "<a href='https://motoglide.app/cars' style='display:inline-block;background:linear-gradient(135deg,#d4a574,#b8860b);color:#1a1c2e;padding:16px 40px;border-radius:50px;font-weight:900;font-size:16px;text-decoration:none;letter-spacing:1px;box-shadow:0 8px 20px rgba(212,165,116,0.3);'>🚗 BOOK NOW &amp; SAVE</a>"
            + "<p style='color:#555;font-size:12px;margin:25px 0 0;'>Offer valid for limited time only. T&amp;C apply.</p>"
            + "</div>"
            // Footer
            + "<div style='padding:20px 30px;text-align:center;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.05);'>"
            + "<p style='color:#d4a574;font-weight:bold;margin:0 0 5px;'>MotoGlide Premium Car Rental</p>"
            + "<p style='color:#555;font-size:11px;margin:0;'>To unsubscribe from promotional emails, contact support@motoglide.com</p>"
            + "</div></div></body></html>";

        String whatsappMsg = "🎉 *EXCLUSIVE OFFER FROM MOTOGLIDE!*\n\n"
            + "Use code: *" + offer.getCode() + "*\n"
            + "Get *" + offer.getDiscountPercentage() + "% OFF* on your next car rental!\n"
            + (offer.getMaxDiscountAmount() != null ? "Max savings: ₹" + offer.getMaxDiscountAmount() + "\n" : "")
            + (offer.getValidUntil() != null ? "Valid until: " + offer.getValidUntil().toLocalDate() + "\n" : "")
            + "\n" + (offer.getDescription() != null ? offer.getDescription() + "\n\n" : "")
            + "Book at: motoglide.app/cars 🚗";

        if (targetEmail != null && !targetEmail.isBlank()) {
            // Send to specific customer
            userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(targetEmail.trim()) && u.isActive()
                    && u.getRole() == com.carrental.entity.User.UserRole.CUSTOMER)
                .findFirst()
                .ifPresent(user -> {
                    sendHtmlEmail(user.getEmail(), subject, htmlBody);
                    if (user.getPhoneNumber() != null) {
                        sendWhatsAppMessage(user.getPhoneNumber(), whatsappMsg);
                    }
                });
        } else {
            // Broadcast to ALL active customers
            userRepository.findAll().stream()
                .filter(u -> u.isActive() && u.getRole() == com.carrental.entity.User.UserRole.CUSTOMER)
                .forEach(user -> {
                    sendHtmlEmail(user.getEmail(), subject, htmlBody);
                    if (user.getPhoneNumber() != null) {
                        sendWhatsAppMessage(user.getPhoneNumber(), whatsappMsg);
                    }
                });
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Throwable e) {
            System.err.println("Error sending HTML email to " + to + ": " + e.getMessage());
            sendEmail(to, subject, "You have a new offer from MotoGlide! Use code: " + subject);
        }
    }

    public void sendFinancialReport(String toEmail, byte[] pdfData) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📊 MotoGlide - Financial Business Report | " + java.time.LocalDate.now());
            
            String html = "<html><body>"
                + "<h2 style='color:#1e3a8a;'>Detailed Financial Business Report</h2>"
                + "<p>Attached is the comprehensive financial report for MotoGlide Car Rental.</p>"
                + "<div style='background:#f3f4f6;padding:20px;border-radius:10px;'>"
                + "<p><strong>Report Date:</strong> " + java.time.LocalDateTime.now() + "</p>"
                + "<p>This report includes revenue breakdowns, periodic performance, and P&L summaries.</p>"
                + "</div>"
                + "<p style='color:#666;font-size:12px;margin-top:20px;'>Generated by MotoGlide Admin System.</p>"
                + "</body></html>";
                
            helper.setText(html, true);
            helper.addAttachment("MotoGlide_Financial_Report_" + java.time.LocalDate.now() + ".pdf", new ByteArrayResource(pdfData));
            
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
