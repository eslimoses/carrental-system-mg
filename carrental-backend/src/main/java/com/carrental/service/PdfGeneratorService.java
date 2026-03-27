package com.carrental.service;

import com.carrental.entity.Bill;
import com.carrental.entity.Booking;
import com.carrental.entity.Payment;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generateInvoicePdf(Booking booking, Payment payment, Bill bill) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, new Color(59, 130, 246));
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(31, 41, 55));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(75, 85, 99));
            Font highlightFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(16, 185, 129));

            document.add(new Paragraph("MOTOGLIDE CAR RENTAL", titleFont));
            document.add(new Paragraph("OFFICIAL INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY)));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", normalFont));

            document.add(new Paragraph("BOOKING REFERENCE: " + booking.getBookingNumber(), headFont));
            if (bill != null) {
                document.add(new Paragraph("INVOICE NO:  " + bill.getBillNumber(), headFont));
            }
            document.add(new Paragraph("DATE ISSUED: " + java.time.LocalDate.now(), normalFont));
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", normalFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("CUSTOMER DETAILS", headFont));
            document.add(new Paragraph("Name:  " + booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(), normalFont));
            document.add(new Paragraph("Email: " + booking.getCustomer().getEmail(), normalFont));
            document.add(new Paragraph("Phone: " + (booking.getCustomer().getPhoneNumber() != null ? booking.getCustomer().getPhoneNumber() : "N/A"), normalFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("VEHICLE & RENTAL INFO", headFont));
            document.add(new Paragraph("Vehicle details: " + booking.getVehicle().getMake() + " " + booking.getVehicle().getModel(), normalFont));
            document.add(new Paragraph("Rental Period:   " + booking.getPickupDate() + " to " + booking.getReturnDate(), normalFont));
            document.add(new Paragraph("Pickup Time:     " + booking.getPickupTime(), normalFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", normalFont));
            document.add(new Paragraph("COST BREAKDOWN", headFont));
            document.add(new Paragraph(String.format("%-40s %s", "Base Rental Amount:", "Rs. " + (booking.getRentalAmount() != null ? booking.getRentalAmount() : "0.00")), normalFont));

            long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getPickupDate(), booking.getReturnDate());
            if (days < 1) days = 1;

            if (Boolean.TRUE.equals(booking.getIncludeInsurance())) {
                document.add(new Paragraph(String.format("%-40s %s", "• Premium Insurance Cover ("+days+" days):", "Rs. " + (java.math.BigDecimal.valueOf(150 * days))), normalFont));
            }
            if (Boolean.TRUE.equals(booking.getIncludeGps())) {
                document.add(new Paragraph(String.format("%-40s %s", "• GPS Navigation System ("+days+" days):", "Rs. " + (java.math.BigDecimal.valueOf(50 * days))), normalFont));
            }
            if (Boolean.TRUE.equals(booking.getIncludeChildSeat())) {
                document.add(new Paragraph(String.format("%-40s %s", "• Child Safety Seat ("+days+" days):", "Rs. " + (java.math.BigDecimal.valueOf(75 * days))), normalFont));
            }
            if (booking.getAdditionalDrivers() != null && booking.getAdditionalDrivers() > 0) {
                document.add(new Paragraph(String.format("%-40s %s", "• Addl. Drivers ("+booking.getAdditionalDrivers()+" x "+days+" days):", "Rs. " + (java.math.BigDecimal.valueOf(100 * booking.getAdditionalDrivers() * days))), normalFont));
            }

            if (booking.getDeliveryFee() != null && booking.getDeliveryFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
                document.add(new Paragraph(String.format("%-40s %s", "Delivery/Pickup Fee:", "Rs. " + booking.getDeliveryFee()), normalFont));
            }
            if (booking.getDiscountAmount() != null && booking.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                document.add(new Paragraph(String.format("%-40s %s", "Promotional Discount:", "-Rs. " + booking.getDiscountAmount()), normalFont));
            }
            if (booking.getCouponDiscount() != null && booking.getCouponDiscount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                document.add(new Paragraph(String.format("%-40s %s", "Coupon Code Savings:", "-Rs. " + booking.getCouponDiscount()), normalFont));
            }
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", normalFont));
            java.math.BigDecimal paidAmount = (payment != null) ? payment.getAmount() : booking.getTotalAmount();
            String amountLabel = (payment != null && payment.getPaymentType() == com.carrental.entity.Payment.PaymentType.REFUND) 
                ? "TOTAL REFUNDED AMOUNT: Rs. " : 
                (payment != null ? "AMOUNT PAID (THIS INVOICE): Rs. " : "TOTAL AMOUNT PAID: Rs. ");
            
            document.add(new Paragraph(amountLabel + String.format("%.2f", paidAmount != null ? paidAmount : java.math.BigDecimal.ZERO), highlightFont));
            
            if (payment != null && paidAmount != null && paidAmount.compareTo(booking.getTotalAmount() != null ? booking.getTotalAmount() : java.math.BigDecimal.ZERO) < 0 && payment.getPaymentType() != com.carrental.entity.Payment.PaymentType.REFUND) {
                document.add(new Paragraph("REMAINING BALANCE DUE: Rs. " + String.format("%.2f", (booking.getTotalAmount() != null ? booking.getTotalAmount() : java.math.BigDecimal.ZERO).subtract(paidAmount)), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(220, 38, 38))));
            }

            document.add(new Paragraph("TOTAL BOOKING AMOUNT: Rs. " + (booking.getTotalAmount() != null ? booking.getTotalAmount() : "0.00"), normalFont));
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", normalFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("PAYMENT DETAILS", headFont));
            document.add(new Paragraph("Transaction ID: " + (payment != null ? payment.getTransactionId() : "N/A"), normalFont));
            document.add(new Paragraph("Payment Method: " + (payment != null ? payment.getPaymentMethod() : "N/A"), normalFont));
            document.add(new Paragraph("Payment Status: " + (payment != null ? payment.getStatus() : "PAID"), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(16, 185, 129))));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for choosing MotoGlide!", titleFont));
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    public byte[] generateFinancialReportPdf(Map<String, Object> stats) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, new Color(30, 41, 59));
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(51, 65, 85));
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(71, 85, 105));
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(5, 150, 105));
            Font expenseFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(220, 38, 38));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(148, 163, 184));

            Paragraph title = new Paragraph("MotoGlide Business Report", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            
            Paragraph sub = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")), footerFont);
            sub.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(sub);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", footerFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("REVENUE BREAKDOWN", sectionFont));
            document.add(new Paragraph(" "));
            addReportLine(document, "ADVANCE RECEIVED:", "Rs. " + String.format("%.2f", stats.get("advanceRevenue")), labelFont, valueFont);
            addReportLine(document, "RENT RECEIVED:", "Rs. " + String.format("%.2f", stats.get("rentalRevenue")), labelFont, valueFont);
            addReportLine(document, "EXTRA CHARGES RECEIVED:", "Rs. " + String.format("%.2f", stats.get("extraChargesRevenue")), labelFont, valueFont);
            addReportLine(document, "AMOUNT RETURNED (REFUNDS):", "Rs. " + String.format("%.2f", stats.get("returnedRevenue")), labelFont, expenseFont);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("PERIODIC PERFORMANCE", sectionFont));
            document.add(new Paragraph(" "));
            addReportLine(document, "LAST 24 HOURS:", "Rs. " + String.format("%.2f", stats.get("revenue24h")), labelFont, valueFont);
            addReportLine(document, "LAST 7 DAYS:", "Rs. " + String.format("%.2f", stats.get("revenue7d")), labelFont, valueFont);
            addReportLine(document, "LAST 30 DAYS:", "Rs. " + String.format("%.2f", stats.get("revenue30d")), labelFont, valueFont);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("PROFIT & LOSS SUMMARY", sectionFont));
            document.add(new Paragraph(" "));
            addReportLine(document, "GROSS REVENUE:", "Rs. " + String.format("%.2f", stats.get("grossRevenue")), labelFont, valueFont);
            addReportLine(document, "ESTIMATED EXPENSES (OPS/TAX):", "Rs. " + String.format("%.2f", stats.get("opsExpenses")), labelFont, expenseFont);
            
            Font netFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(37, 99, 235));
            addReportLine(document, "NET PROFIT:", "Rs. " + String.format("%.2f", stats.get("netProfit")), labelFont, netFont);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("---------------------------------------------------------------------------------------------------", footerFont));
            document.add(new Paragraph(" "));

            Paragraph total = new Paragraph("TOTAL NET REVENUE: Rs. " + String.format("%.2f", stats.get("totalRevenue")), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(30, 41, 59)));
            total.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph(" "));
            Paragraph foot = new Paragraph("MotoGlide Car Rental Dashboard | Confidential Financial Report", footerFont);
            foot.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(foot);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }

    private void addReportLine(Document doc, String label, String value, Font labelFont, Font valueFont) throws Exception {
        Paragraph p = new Paragraph();
        p.add(new com.lowagie.text.Chunk(String.format("%-40s", label), labelFont));
        p.add(new com.lowagie.text.Chunk(value, valueFont));
        p.setSpacingBefore(5);
        doc.add(p);
    }
}
