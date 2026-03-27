package com.carrental.service;

import com.carrental.dto.PaymentDTO;
import com.carrental.entity.Bill;
import com.carrental.entity.Booking;
import com.carrental.entity.Booking.BookingStatus;
import com.carrental.entity.Payment;
import com.carrental.entity.Payment.PaymentStatus;
import com.carrental.entity.Payment.PaymentType;
import com.carrental.entity.Vehicle;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final BillService billService;
    private final NotificationService notificationService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    /**
     * Complete payment processing flow:
     * 1. Creates payment record with SUCCESS status
     * 2. Updates booking status to CONFIRMED
     * 3. Generates invoice (Bill)
     * 4. Sends confirmation email with invoice details via Gmail SMTP
     * 5. Returns complete payment summary
     */
    public Map<String, Object> processFullPayment(Long bookingId, PaymentDTO paymentDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 1. Create separate payment records for tracking
        String transactionId = generateTransactionId();
        
        // 1a. Advance Payment portion
        Payment advancePay = new Payment();
        advancePay.setBooking(booking);
        advancePay.setAmount(booking.getAdvanceAmount());
        advancePay.setPaymentType(PaymentType.ADVANCE);
        advancePay.setPaymentMethod(Payment.PaymentMethod.valueOf(
                paymentDTO.getPaymentMethod() != null ? paymentDTO.getPaymentMethod() : "UPI"));
        advancePay.setTransactionId(transactionId + "-ADV");
        advancePay.setStatus(PaymentStatus.SUCCESS);
        advancePay.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(advancePay);

        // 1b. Rental Payment (Balance of base rental)
        Payment rentalPay = new Payment();
        rentalPay.setBooking(booking);
        rentalPay.setAmount(booking.getRentalAmount().subtract(booking.getAdvanceAmount()));
        rentalPay.setPaymentType(PaymentType.RENTAL);
        rentalPay.setPaymentMethod(advancePay.getPaymentMethod());
        rentalPay.setTransactionId(transactionId + "-RENT");
        rentalPay.setStatus(PaymentStatus.SUCCESS);
        rentalPay.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(rentalPay);

        // 1c. Extra Charges (Extras + Delivery - Coupon)
        BigDecimal extrasTotal = booking.getExtraCharges()
                .add(booking.getDeliveryFee())
                .subtract(booking.getCouponDiscount());
        if (extrasTotal.compareTo(java.math.BigDecimal.ZERO) > 0) {
            Payment extrasPay = new Payment();
            extrasPay.setBooking(booking);
            extrasPay.setAmount(extrasTotal);
            extrasPay.setPaymentType(PaymentType.EXTRA_CHARGES);
            extrasPay.setPaymentMethod(advancePay.getPaymentMethod());
            extrasPay.setTransactionId(transactionId + "-EXT");
            extrasPay.setStatus(PaymentStatus.SUCCESS);
            extrasPay.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(extrasPay);
        }

        // 2. Update booking status to CONFIRMED and mark as paid
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setAdvancePaid(true);
        booking.setAdvancePaidDate(LocalDateTime.now());
        booking.setRentalPaid(true);
        booking.setRentalPaidDate(LocalDateTime.now());
        bookingRepository.save(booking);

        Payment savedPayment = advancePay; // Use first one for the summary response

        // 3. Generate invoice (Bill)
        Bill bill = null;
        try {
            bill = billService.generateBill(bookingId);
        } catch (Exception e) {
            System.err.println("Error generating bill: " + e.getMessage());
        }

        // 4. Send confirmation email with invoice via Gmail SMTP
        try {
            notificationService.sendPaymentConfirmationWithInvoice(booking, savedPayment, bill);
        } catch (Exception e) {
            System.err.println("Error sending payment confirmation email: " + e.getMessage());
        }

        // 5. Build and return response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment processed successfully");
        response.put("transactionId", savedPayment.getTransactionId());
        response.put("amount", savedPayment.getAmount());
        response.put("status", "SUCCESS");
        response.put("bookingNumber", booking.getBookingNumber());
        response.put("bookingStatus", "CONFIRMED");
        if (bill != null) {
            response.put("billNumber", bill.getBillNumber());
            response.put("invoiceGenerated", true);
        }
        response.put("emailSent", true);
        return response;
    }

    public Map<String, Object> processAdvancePayment(Long bookingId, PaymentDTO paymentDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 1. Create payment record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getAdvanceAmount());
        payment.setPaymentType(PaymentType.ADVANCE);
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentDTO.getPaymentMethod()));
        // Use Razorpay Payment ID as our transaction ID if available
        String txnId = paymentDTO.getTransactionId() != null && !paymentDTO.getTransactionId().isEmpty()
                ? paymentDTO.getTransactionId() : generateTransactionId();
        payment.setTransactionId(txnId);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // 2. Update booking status to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setAdvancePaid(true);
        booking.setAdvancePaidDate(LocalDateTime.now());
        bookingRepository.save(booking);

        // 3. Generate invoice (Bill)
        Bill bill = null;
        try {
            bill = billService.generateBill(bookingId);
        } catch (Exception e) {
            System.err.println("Error generating bill: " + e.getMessage());
        }

        // 4. Send email confirmation with invoice PDF
        try {
            notificationService.sendPaymentConfirmationWithInvoice(booking, savedPayment, bill);
        } catch (Exception e) {
            System.err.println("Error sending payment confirmation email: " + e.getMessage());
        }

        // 5. Build response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment processed successfully");
        response.put("transactionId", savedPayment.getTransactionId());
        response.put("amount", savedPayment.getAmount());
        response.put("status", "SUCCESS");
        response.put("bookingNumber", booking.getBookingNumber());
        response.put("bookingStatus", "CONFIRMED");
        if (bill != null) {
            response.put("billNumber", bill.getBillNumber());
            response.put("invoiceGenerated", true);
        }
        response.put("emailSent", true);
        return response;
    }

    public Payment processRentalPayment(Long bookingId, PaymentDTO paymentDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getRentalAmount());
        payment.setPaymentType(PaymentType.RENTAL);
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentDTO.getPaymentMethod()));
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);
        booking.setRentalPaid(true);
        booking.setRentalPaidDate(LocalDateTime.now());
        bookingRepository.save(booking);

        return savedPayment;
    }

    public Payment processExtraChargesPayment(Long bookingId, Double extraCharges, PaymentDTO paymentDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(java.math.BigDecimal.valueOf(extraCharges));
        payment.setPaymentType(PaymentType.EXTRA_CHARGES);
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentDTO.getPaymentMethod()));
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public List<PaymentDTO> getBookingPayments(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return paymentRepository.findByBooking(booking)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Map<String, Object> verifyPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", payment.getId());
        response.put("status", payment.getStatus().toString());
        response.put("transactionId", payment.getTransactionId());
        response.put("amount", payment.getAmount());
        return response;
    }

    // --- Razorpay Specific Logic ---

    public String createRazorpayOrder(Double amount, String bookingNumber) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100)); // Razorpay accepts amount in paise (x100)
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", bookingNumber);
        
        Order order = razorpayClient.orders.create(orderRequest);
        return order.get("id");
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (Exception e) {
            return false;
        }
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    private PaymentDTO convertToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .paymentType(payment.getPaymentType().toString())
                .paymentMethod(payment.getPaymentMethod().toString())
                .transactionId(payment.getTransactionId())
                .status(payment.getStatus().toString())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
