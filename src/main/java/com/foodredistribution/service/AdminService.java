package com.foodredistribution.service;

import com.foodredistribution.model.Admin;
import com.foodredistribution.model.FoodDonation;
import com.foodredistribution.model.Organization;
import com.foodredistribution.repository.AdminRepository;
import com.foodredistribution.repository.FoodDonationRepository;
import com.foodredistribution.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    public Admin createAdmin(Admin admin, PasswordEncoder passwordEncoder) {
        if (adminRepository.existsByUsername(admin.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        return adminRepository.save(admin);
    }

    public Optional<Admin> findByUsername(String username) {
        return adminRepository.findByUsername(username);
    }

    public boolean validateCredentials(String username, String password, PasswordEncoder passwordEncoder) {
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            return false;
        }
        Admin admin = adminOpt.get();
        return passwordEncoder.matches(password, admin.getPassword());
    }

    public List<FoodDonation> getAllDonations() {
        return donationRepository.findAll();
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public List<FoodDonation> getPendingRequests() {
        return donationRepository.findByStatus("RESERVED");
    }

    public FoodDonation approveDonation(String donationId, String adminId, String notes) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
        
        if (!"RESERVED".equals(donation.getStatus())) {
            throw new RuntimeException("Can only approve RESERVED donations");
        }

        donation.setStatus("DONATED");
        donation.setProcessedBy(adminId);
        donation.setProcessedDate(new Date());
        donation.setNotes(notes);
        
        return donationRepository.save(donation);
    }

    public FoodDonation rejectDonation(String donationId, String adminId, String notes) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
        
        if (!"RESERVED".equals(donation.getStatus())) {
            throw new RuntimeException("Can only reject RESERVED donations");
        }

        donation.setStatus("REJECTED");
        donation.setProcessedBy(adminId);
        donation.setProcessedDate(new Date());
        donation.setNotes(notes);
        donation.setRequestedBy(null);
        donation.setRequestedDate(null);
        
        return donationRepository.save(donation);
    }
} 