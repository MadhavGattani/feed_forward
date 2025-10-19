package com.foodredistribution.service;

import com.foodredistribution.model.FoodDonation;
import com.foodredistribution.repository.FoodDonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {
    
    @Autowired
    private FoodDonationRepository foodDonationRepository;
    
    public FoodDonation createDonation(FoodDonation donation) {
        validateDonation(donation);
        donation.setStatus("AVAILABLE");
        donation.setCreatedDate(new Date());
        return foodDonationRepository.save(donation);
    }
    
    public List<FoodDonation> getAllDonations() {
        return foodDonationRepository.findAll();
    }
    
    public FoodDonation getDonationById(String id) {
        return foodDonationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found"));
    }
    
    public List<FoodDonation> getDonationsByOrganization(String organizationId) {
        return foodDonationRepository.findByOrganizationId(organizationId);
    }
    
    public List<FoodDonation> getDonationsByStatus(String status) {
        return foodDonationRepository.findByStatus(status);
    }
    
    public FoodDonation updateDonation(String id, FoodDonation donation) {
        FoodDonation existing = getDonationById(id);
        
        // Update fields
        if (donation.getFoodType() != null) existing.setFoodType(donation.getFoodType());
        if (donation.getDonorName() != null) existing.setDonorName(donation.getDonorName());
        if (donation.getQuantity() != null) existing.setQuantity(donation.getQuantity());
        if (donation.getExpiryDate() != null) existing.setExpiryDate(donation.getExpiryDate());
        
        return foodDonationRepository.save(existing);
    }
    
    public FoodDonation updateDonationStatus(String id, String newStatus) {
        FoodDonation donation = getDonationById(id);
        donation.setStatus(newStatus);
        return foodDonationRepository.save(donation);
    }
    
    public FoodDonation cancelDonation(String id) {
        FoodDonation donation = getDonationById(id);
        
        if (!"AVAILABLE".equals(donation.getStatus())) {
            throw new RuntimeException("Can only cancel donations that are in AVAILABLE status");
        }
        
        donation.setStatus("CANCELLED");
        return foodDonationRepository.save(donation);
    }
    
    public void deleteDonation(String id) {
        FoodDonation donation = getDonationById(id);
        foodDonationRepository.delete(donation);
    }
    
    public List<FoodDonation> getExpiringDonations(int days) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, days);
        Date futureDate = calendar.getTime();
        
        return foodDonationRepository.findByExpiryDateBeforeAndStatus(futureDate, "AVAILABLE");
    }
    
    public List<FoodDonation> getExpiredDonations() {
        Date today = new Date();
        return foodDonationRepository.findByExpiryDateBeforeAndStatusNot(today, "EXPIRED");
    }
    
    public void checkAndUpdateExpiredDonations() {
        List<FoodDonation> expiredDonations = getExpiredDonations();
        
        for (FoodDonation donation : expiredDonations) {
            donation.setStatus("EXPIRED");
            foodDonationRepository.save(donation);
        }
    }

    public List<FoodDonation> getAvailableDonationsFromOthers(String organizationId) {
        // Get all available donations
        List<FoodDonation> availableDonations = foodDonationRepository.findByStatus("AVAILABLE");
        
        // Filter out donations from the requesting organization
        return availableDonations.stream()
            .filter(donation -> !donation.getOrganizationId().equals(organizationId))
            .collect(Collectors.toList());
    }

    public FoodDonation requestDonation(String donationId, String requestingOrgId) {
        FoodDonation donation = getDonationById(donationId);
        
        // Verify donation is available
        if (!"AVAILABLE".equals(donation.getStatus())) {
            throw new IllegalStateException("This donation is no longer available");
        }
        
        // Verify requesting org is not the donor
        if (donation.getOrganizationId().equals(requestingOrgId)) {
            throw new IllegalStateException("Organizations cannot request their own donations");
        }
        
        // Update donation status
        donation.setStatus("RESERVED");
        donation.setRequestedBy(requestingOrgId);
        donation.setRequestedDate(new Date());
        
        return foodDonationRepository.save(donation);
    }

    private void validateDonation(FoodDonation donation) {
        if (donation.getDonorName() == null || donation.getDonorName().trim().isEmpty()) {
            throw new IllegalArgumentException("Donor name is required");
        }
        if (donation.getFoodType() == null || donation.getFoodType().trim().isEmpty()) {
            throw new IllegalArgumentException("Food type is required");
        }
        if (donation.getFoodName() == null || donation.getFoodName().trim().isEmpty()) {
            throw new IllegalArgumentException("Food name is required");
        }
        if (donation.getQuantity() == null || donation.getQuantity().trim().isEmpty()) {
            throw new IllegalArgumentException("Quantity is required");
        }
        if (donation.getQuantityUnit() == null || donation.getQuantityUnit().trim().isEmpty()) {
            throw new IllegalArgumentException("Quantity unit is required");
        }
        if (donation.getExpiryDate() == null) {
            throw new IllegalArgumentException("Expiry date is required");
        }
        if (donation.getPickupAddress() == null || donation.getPickupAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Pickup address is required");
        }
        if (donation.getContactPhone() == null || donation.getContactPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Contact phone is required");
        }
    }
}
