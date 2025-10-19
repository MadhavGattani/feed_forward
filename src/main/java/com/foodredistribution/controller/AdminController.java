package com.foodredistribution.controller;

import com.foodredistribution.model.Admin;
import com.foodredistribution.model.FoodDonation;
import com.foodredistribution.model.Organization;
import com.foodredistribution.repository.AdminRepository;
import com.foodredistribution.repository.OrganizationRepository;
import com.foodredistribution.service.AdminService;
import com.foodredistribution.service.DonationService;
import com.foodredistribution.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final DonationService donationService;
    private final AdminRepository adminRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AdminController(
            AdminService adminService,
            DonationService donationService,
            AdminRepository adminRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.donationService = donationService;
        this.adminRepository = adminRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Login endpoint - defensive:
     *  - validates input
     *  - catches repository/DB errors and logs them
     *  - returns 401 for invalid credentials, 400 for bad request, 500 for server errors
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        // Validate request body
        if (credentials == null || credentials.get("username") == null || credentials.get("password") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "username and password are required"));
        }

        String username = credentials.get("username");
        String password = credentials.get("password");

        try {
            Optional<Admin> adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isEmpty()) {
                // Do not reveal whether username exists; return 401 for credentials problem
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            Admin admin = adminOpt.get();
            // If password is null/missing in DB -> server misconfiguration
            if (admin.getPassword() == null) {
                // Log a helpful message for debugging
                System.err.println("Admin record missing password for user: " + username);
                return ResponseEntity.status(500).body(Map.of("error", "Server misconfiguration"));
            }

            boolean matches = false;
            try {
                matches = passwordEncoder.matches(password, admin.getPassword());
            } catch (Exception e) {
                // bcrypt / encoder problems should be logged
                System.err.println("Password matching error for user " + username + ": " + e.getMessage());
                return ResponseEntity.status(500).body(Map.of("error", "Server error comparing passwords"));
            }

            if (!matches) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            // Success: generate token and return
            String token = jwtUtil.generateToken(admin.getUsername(), "ADMIN");
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            // Log full stacktrace to server console for debugging
            System.err.println("Error during login for user: " + username);
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details", ex.getMessage()));
        }
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        List<Organization> organizations = adminService.getAllOrganizations();
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/donations")
    public ResponseEntity<List<FoodDonation>> getAllDonations() {
        List<FoodDonation> donations = adminService.getAllDonations();
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<FoodDonation>> getPendingRequests() {
        List<FoodDonation> pendingRequests = adminService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    @PutMapping("/requests/{donationId}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable String donationId,
            @RequestHeader("Authorization") String token,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String adminId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            String notes = body != null ? body.get("notes") : "";
            FoodDonation approvedDonation = adminService.approveDonation(donationId, adminId, notes);
            return ResponseEntity.ok(approvedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/requests/{donationId}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable String donationId,
            @RequestHeader("Authorization") String token,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String adminId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            String notes = body != null ? body.get("notes") : "";
            FoodDonation rejectedDonation = adminService.rejectDonation(donationId, adminId, notes);
            return ResponseEntity.ok(rejectedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
