package com.foodredistribution.service;

import com.foodredistribution.model.DonationRequest;
import com.foodredistribution.repository.DonationRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class DonationRequestService {

    @Autowired
    private DonationRequestRepository donationRequestRepository;

    public DonationRequest createRequest(DonationRequest request) {
        return donationRequestRepository.save(request);
    }

    public List<DonationRequest> getRequestsByUser(String userId) {
        return donationRequestRepository.findByOrganizationId(userId);
    }

    public void markNotificationAsShown(String requestId) {
        DonationRequest request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setNotificationShown(true);
        donationRequestRepository.save(request);
    }

    public List<DonationRequest> getPendingRequests() {
        return donationRequestRepository.findByStatus("PENDING");
    }

    public DonationRequest approveRequest(String requestId, String adminId, String notes) {
        DonationRequest request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("APPROVED");
        request.setApprovedBy(adminId);
        request.setApprovalDate(new Date());
        request.setNotes(notes);
        return donationRequestRepository.save(request);
    }

    public DonationRequest rejectRequest(String requestId, String adminId, String notes) {
        DonationRequest request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus("REJECTED");
        request.setApprovedBy(adminId);
        request.setApprovalDate(new Date());
        request.setNotes(notes);
        return donationRequestRepository.save(request);
    }
} 