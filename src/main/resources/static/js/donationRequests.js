let selectedDonationId = null;

// Load available donations from other users
function loadAvailableDonations() {
    const currentUserId = localStorage.getItem('userId');
    fetch(`/api/donations/others/${currentUserId}`)
        .then(response => response.json())
        .then(donations => {
            const tableBody = document.getElementById('availableDonationsTable');
            tableBody.innerHTML = '';
            
            donations.forEach(donation => {
                const row = `
                    <tr>
                        <td>${donation.donorName}</td>
                        <td>${donation.foodType}</td>
                        <td>${donation.quantity}</td>
                        <td>${new Date(donation.expiryDate).toLocaleDateString()}</td>
                        <td>${donation.location}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="showRequestModal('${donation.id}', '${donation.foodType}')">
                                Request
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error loading donations:', error));
}

// Load user's requests
function loadMyRequests() {
    const currentUserId = localStorage.getItem('userId');
    fetch(`/api/donation-requests/status/${currentUserId}`)
        .then(response => response.json())
        .then(requests => {
            const tableBody = document.getElementById('myRequestsTable');
            tableBody.innerHTML = '';
            
            requests.forEach(request => {
                const statusClass = `status-${request.status.toLowerCase()}`;
                const row = `
                    <tr>
                        <td>${request.id}</td>
                        <td>${request.foodType}</td>
                        <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                        <td><span class="status-badge ${statusClass}">${request.status}</span></td>
                        <td>${request.notes || '-'}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error loading requests:', error));
}

// Show request confirmation modal
function showRequestModal(donationId, foodType) {
    selectedDonationId = donationId;
    const detailsDiv = document.getElementById('donationDetails');
    detailsDiv.innerHTML = `<p>Food Type: ${foodType}</p>`;
    new bootstrap.Modal(document.getElementById('requestConfirmModal')).show();
}

// Submit donation request
function submitRequest() {
    const currentUserId = localStorage.getItem('userId');
    
    fetch('/api/donation-requests/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            organizationId: currentUserId,
            donationId: selectedDonationId
        })
    })
    .then(response => response.json())
    .then(data => {
        bootstrap.Modal.getInstance(document.getElementById('requestConfirmModal')).hide();
        loadAvailableDonations();
        loadMyRequests();
        showNotification('Request submitted successfully! Waiting for admin approval.');
    })
    .catch(error => console.error('Error submitting request:', error));
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '1050';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Check for request status updates
function checkRequestStatus() {
    const currentUserId = localStorage.getItem('userId');
    
    fetch(`/api/donation-requests/status/${currentUserId}`)
        .then(response => response.json())
        .then(requests => {
            requests.forEach(request => {
                if (request.status === 'APPROVED' && !request.notificationShown) {
                    showNotification('Congratulations! Your donation request has been approved!');
                    markNotificationAsShown(request.id);
                    loadMyRequests(); // Refresh the requests list
                }
            });
        })
        .catch(error => console.error('Error checking request status:', error));
}

// Mark notification as shown
function markNotificationAsShown(requestId) {
    fetch(`/api/donation-requests/${requestId}/mark-notified`, {
        method: 'POST'
    }).catch(error => console.error('Error marking notification:', error));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableDonations();
    loadMyRequests();
    // Check for updates every 30 seconds
    setInterval(checkRequestStatus, 30000);
}); 