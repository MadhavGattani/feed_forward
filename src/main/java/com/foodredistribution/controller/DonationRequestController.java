package com.foodredistribution.controller;

import com.foodredistribution.model.DonationRequest;
import com.foodredistribution.service.DonationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donation-requests")
public class DonationRequestController {

    @Autowired
    private DonationRequestService donationRequestService;

    @PostMapping("/create")
    public ResponseEntity<DonationRequest> createRequest(@RequestBody DonationRequest request) {
        return ResponseEntity.ok(donationRequestService.createRequest(request));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<List<DonationRequest>> getUserRequests(@PathVariable String userId) {
        return ResponseEntity.ok(donationRequestService.getRequestsByUser(userId));
    }

    @PostMapping("/{requestId}/mark-notified")
    public ResponseEntity<Void> markNotificationAsShown(@PathVariable String requestId) {
        donationRequestService.markNotificationAsShown(requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<List<DonationRequest>> getPendingRequests() {
        return ResponseEntity.ok(donationRequestService.getPendingRequests());
    }

    @PostMapping("/admin/{requestId}/approve")
    public ResponseEntity<DonationRequest> approveRequest(
            @PathVariable String requestId,
            @RequestParam String adminId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(donationRequestService.approveRequest(requestId, adminId, notes));
    }

    @PostMapping("/admin/{requestId}/reject")
    public ResponseEntity<DonationRequest> rejectRequest(
            @PathVariable String requestId,
            @RequestParam String adminId,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(donationRequestService.rejectRequest(requestId, adminId, notes));
    }
} 