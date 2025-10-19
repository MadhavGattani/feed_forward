package com.foodredistribution.service;

import com.foodredistribution.model.Organization;
import com.foodredistribution.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrganizationService {
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public Organization registerOrganization(Organization organization) {
        if (organizationRepository.existsByEmail(organization.getEmail())) {
            throw new RuntimeException("An organization with this email already exists");
        }
        
        // Encode password
        organization.setPassword(passwordEncoder.encode(organization.getPassword()));
        
        // Set registration date
        organization.setRegistrationDate(new Date());
        
        return organizationRepository.save(organization);
    }
    
    public Optional<Organization> login(String email, String password) {
        Optional<Organization> orgOpt = organizationRepository.findByEmail(email);
        if (orgOpt.isPresent()) {
            Organization org = orgOpt.get();
            if (passwordEncoder.matches(password, org.getPassword())) {
                return Optional.of(org);
            }
        }
        return Optional.empty();
    }
    
    public Organization getOrganizationById(String id) {
        return organizationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Organization not found"));
    }
    
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }
    
    public Organization updateOrganization(String id, Organization updatedOrg) {
        Organization existing = getOrganizationById(id);
        
        // Update fields
        if (updatedOrg.getName() != null) existing.setName(updatedOrg.getName());
        if (updatedOrg.getEmail() != null) existing.setEmail(updatedOrg.getEmail());
        if (updatedOrg.getPhone() != null) existing.setPhone(updatedOrg.getPhone());
        if (updatedOrg.getAddress() != null) existing.setAddress(updatedOrg.getAddress());
        if (updatedOrg.getDescription() != null) existing.setDescription(updatedOrg.getDescription());
        if (updatedOrg.getType() != null) existing.setType(updatedOrg.getType());
        
        return organizationRepository.save(existing);
    }
    
    public void deleteOrganization(String id) {
        Organization org = getOrganizationById(id);
        organizationRepository.delete(org);
    }
}
