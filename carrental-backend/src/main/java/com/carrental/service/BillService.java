package com.carrental.service;

import com.carrental.dto.BillDTO;
import com.carrental.entity.Bill;
import com.carrental.entity.Bill.BillStatus;
import com.carrental.entity.Booking;
import com.carrental.entity.Vehicle;
import com.carrental.repository.BillRepository;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BillService {
    private final BillRepository billRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;

    public Bill generateBill(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Vehicle vehicle = booking.getVehicle();

        Bill bill = new Bill();
        bill.setBooking(booking);
        bill.setBillNumber("BILL-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        bill.setCustomer(booking.getCustomer());
        bill.setVehicle(vehicle);

        // Calculate rental days
        long days = ChronoUnit.DAYS.between(booking.getPickupDate(), booking.getReturnDate());
        bill.setRentalDays((int) days);
        bill.setDailyRate(vehicle.getDailyRate());
        bill.setRentalAmount(booking.getRentalAmount());
        bill.setDeliveryFee(booking.getDeliveryFee());

        // Set extra charges from booking
        bill.setExtraKmCharge(booking.getExtraKmCharge());
        bill.setExtraDaysCharge(booking.getExtraDaysCharge());
        
        // Set discount info
        bill.setDiscountPercentage(booking.getDiscountPercentage());
        bill.setDiscountAmount(booking.getDiscountAmount());
        
        // Set extra options charges
        bill.setExtraOptionsCharge(booking.getExtraCharges());

        // Calculate totals
        bill.setAdvanceAmount(booking.getAdvanceAmount());
        bill.setAdvancePaid(booking.getAdvancePaid() ? booking.getAdvanceAmount() : java.math.BigDecimal.ZERO);
        
        java.math.BigDecimal total = booking.getRentalAmount()
                .add(booking.getDeliveryFee())
                .add(booking.getExtraKmCharge())
                .add(booking.getExtraDaysCharge())
                .add(booking.getExtraCharges() != null ? booking.getExtraCharges() : java.math.BigDecimal.ZERO);
        
        bill.setTotalAmount(total);
        bill.setBalanceAmount(total.subtract(bill.getAdvancePaid()));
        bill.setStatus(BillStatus.DRAFT);
        bill.setBillDate(LocalDateTime.now());

        return billRepository.save(bill);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
    }

    public Bill getBillByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return billRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
    }

    public List<BillDTO> getCustomerBills(Long customerId) {
        return billRepository.findAll()
                .stream()
                .filter(bill -> bill.getCustomer().getId().equals(customerId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void markBillAsPaid(Long billId) {
        Bill bill = getBillById(billId);
        bill.setStatus(BillStatus.PAID);
        bill.setBalanceAmount(java.math.BigDecimal.ZERO);
        billRepository.save(bill);
    }

    public void sendBillNotification(Long billId) {
        Bill bill = getBillById(billId);
        bill.setStatus(BillStatus.SENT);
        billRepository.save(bill);
        
        // Send email notifications
        notificationService.sendBillEmail(bill);
    }

    private BillDTO convertToDTO(Bill bill) {
        return BillDTO.builder()
                .id(bill.getId())
                .bookingId(bill.getBooking().getId())
                .customerId(bill.getCustomer().getId())
                .vehicleId(bill.getVehicle().getId())
                .rentalCost(bill.getRentalAmount())
                .deliveryFee(bill.getDeliveryFee())
                .extraCharges(bill.getExtraKmCharge().add(bill.getExtraDaysCharge()))
                .advancePaid(bill.getAdvancePaid())
                .totalAmount(bill.getTotalAmount())
                .amountDue(bill.getBalanceAmount())
                .status(bill.getStatus().toString())
                .billDate(bill.getBillDate())
                .build();
    }
}
