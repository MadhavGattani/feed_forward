package com.foodredistribution.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "donation_requests")
public class DonationRequest {
    @Id
    private String id;
    private String organizationId;
    private String donationId;
    private String status; // PENDING, APPROVED, REJECTED
    private Date requestDate;
    private Date approvalDate;
    private String approvedBy; // Admin ID
    private String notes;
    private boolean notificationShown;
    private String processedBy;
    private Date processedDate;

    public DonationRequest() {
        this.requestDate = new Date();
        this.status = "PENDING";
        this.notificationShown = false;
    }

    public DonationRequest(String organizationId, String donationId) {
        this();
        this.organizationId = organizationId;
        this.donationId = donationId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getDonationId() { return donationId; }
    public void setDonationId(String donationId) { this.donationId = donationId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getRequestDate() { return requestDate; }
    public void setRequestDate(Date requestDate) { this.requestDate = requestDate; }

    public Date getApprovalDate() { return approvalDate; }
    public void setApprovalDate(Date approvalDate) { this.approvalDate = approvalDate; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isNotificationShown() {
        return notificationShown;
    }

    public void setNotificationShown(boolean notificationShown) {
        this.notificationShown = notificationShown;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public Date getProcessedDate() {
        return processedDate;
    }

    public void setProcessedDate(Date processedDate) {
        this.processedDate = processedDate;
    }
} 