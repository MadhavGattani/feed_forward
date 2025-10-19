package com.foodredistribution.controller;

import com.foodredistribution.model.FoodDonation;
import com.foodredistribution.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {
    
    @Autowired
    private DonationService donationService;
    
    @PostMapping
    public ResponseEntity<FoodDonation> createDonation(@RequestBody FoodDonation donation) {
        return ResponseEntity.ok(donationService.createDonation(donation));
    }
    
    @GetMapping
    public ResponseEntity<List<FoodDonation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FoodDonation> getDonationById(@PathVariable String id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }
    
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<FoodDonation>> getDonationsByOrganization(@PathVariable String organizationId) {
        List<FoodDonation> donations = donationService.getDonationsByOrganization(organizationId);
        return ResponseEntity.ok(donations);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<FoodDonation>> getAvailableDonations() {
        List<FoodDonation> donations = donationService.getDonationsByStatus("AVAILABLE");
        return ResponseEntity.ok(donations);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDonationStatus(@PathVariable String id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            
            FoodDonation updatedDonation = donationService.updateDonationStatus(id, newStatus);
            return ResponseEntity.ok(updatedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonation(@PathVariable String id, @RequestBody FoodDonation donation) {
        try {
            FoodDonation updatedDonation = donationService.updateDonation(id, donation);
            return ResponseEntity.ok(updatedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelDonation(@PathVariable String id) {
        try {
            FoodDonation cancelledDonation = donationService.cancelDonation(id);
            return ResponseEntity.ok(cancelledDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable String id) {
        try {
            donationService.deleteDonation(id);
            return ResponseEntity.ok("Donation deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/expiring")
    public ResponseEntity<List<FoodDonation>> getExpiringDonations(@RequestParam(defaultValue = "3") int days) {
        List<FoodDonation> expiringDonations = donationService.getExpiringDonations(days);
        return ResponseEntity.ok(expiringDonations);
    }
    
    @GetMapping("/expired")
    public ResponseEntity<List<FoodDonation>> getExpiredDonations() {
        List<FoodDonation> expiredDonations = donationService.getExpiredDonations();
        return ResponseEntity.ok(expiredDonations);
    }
    
    @GetMapping("/available/{organizationId}")
    public ResponseEntity<List<FoodDonation>> getAvailableDonationsFromOthers(@PathVariable String organizationId) {
        List<FoodDonation> availableDonations = donationService.getAvailableDonationsFromOthers(organizationId);
        return ResponseEntity.ok(availableDonations);
    }
    
    @PostMapping("/{donationId}/request")
    public ResponseEntity<FoodDonation> requestDonation(
            @PathVariable String donationId,
            @RequestBody Map<String, String> request) {
        String requestingOrgId = request.get("organizationId");
        FoodDonation donation = donationService.requestDonation(donationId, requestingOrgId);
        return ResponseEntity.ok(donation);
    }
}
