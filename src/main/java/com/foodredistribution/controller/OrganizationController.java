package com.foodredistribution.controller;

import com.foodredistribution.model.Organization;
import com.foodredistribution.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {
    
    @Autowired
    private OrganizationService organizationService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Organization organization) {
        try {
            Organization saved = organizationService.registerOrganization(organization);
            // Don't return password in response
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String password = payload.get("password");
            Optional<Organization> orgOpt = organizationService.login(email, password);
            if (orgOpt.isPresent()) {
                Organization org = orgOpt.get();
                // Don't return password in response
                org.setPassword(null);
                return ResponseEntity.ok(org);
            } else {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganization(@PathVariable String id) {
        try {
            Organization org = organizationService.getOrganizationById(id);
            // Don't return password in response
            org.setPassword(null);
            return ResponseEntity.ok(org);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        List<Organization> organizations = organizationService.getAllOrganizations();
        // Don't return passwords in response
        organizations.forEach(org -> org.setPassword(null));
        return ResponseEntity.ok(organizations);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(@PathVariable String id, @RequestBody Organization organization) {
        try {
            Organization updatedOrg = organizationService.updateOrganization(id, organization);
            // Don't return password in response
            updatedOrg.setPassword(null);
            return ResponseEntity.ok(updatedOrg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable String id) {
        try {
            organizationService.deleteOrganization(id);
            return ResponseEntity.ok("Organization deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
