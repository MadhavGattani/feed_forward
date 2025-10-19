document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize the page
    loadDonations();
    loadRequests();
    loadOrganizations();
    setupEventListeners();

    // Tab navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabId).style.display = 'block';
        });
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        window.location.href = 'index.html';
    });
});

function setupEventListeners() {
    // Approval modal buttons
    document.getElementById('approveBtn').addEventListener('click', function() {
        const requestId = this.getAttribute('data-request-id');
        const notes = document.getElementById('approvalNotes').value;
        approveRequest(requestId, notes);
    });

    document.getElementById('rejectBtn').addEventListener('click', function() {
        const requestId = this.getAttribute('data-request-id');
        const notes = document.getElementById('approvalNotes').value;
        rejectRequest(requestId, notes);
    });
}

function loadDonations() {
    fetch('/api/admin/donations/available', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(donations => {
        const tbody = document.getElementById('donationsTableBody');
        tbody.innerHTML = '';
        
        donations.forEach(donation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${donation.foodType}</td>
                <td>${donation.foodName}</td>
                <td>${donation.quantity} ${donation.quantityUnit}</td>
                <td>${new Date(donation.expiryDate).toLocaleDateString()}</td>
                <td><span class="badge bg-${getStatusBadgeClass(donation.status)}">${donation.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewDonationDetails('${donation.id}')">
                        View Details
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading donations:', error));
}

function loadRequests() {
    fetch('/api/admin/requests/pending', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(requests => {
        const container = document.getElementById('requestsContainer');
        container.innerHTML = '';
        
        requests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'card request-card';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Request #${request.id}</h5>
                    <p class="card-text">
                        <strong>Organization:</strong> ${request.organizationId}<br>
                        <strong>Donation:</strong> ${request.donationId}<br>
                        <strong>Request Date:</strong> ${new Date(request.requestDate).toLocaleString()}
                    </p>
                    <button class="btn btn-primary" onclick="showApprovalModal('${request.id}')">
                        Review Request
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    })
    .catch(error => console.error('Error loading requests:', error));
}

function loadOrganizations() {
    fetch('/api/organizations', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        }
    })
    .then(response => response.json())
    .then(organizations => {
        const tbody = document.getElementById('organizationsTableBody');
        tbody.innerHTML = '';
        
        organizations.forEach(org => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${org.name}</td>
                <td>${org.type}</td>
                <td>${org.email}</td>
                <td>${org.phone}</td>
                <td>${org.address}</td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading organizations:', error));
}

function showApprovalModal(requestId) {
    document.getElementById('approveBtn').setAttribute('data-request-id', requestId);
    document.getElementById('rejectBtn').setAttribute('data-request-id', requestId);
    document.getElementById('approvalNotes').value = '';
    new bootstrap.Modal(document.getElementById('approvalModal')).show();
}

function approveRequest(requestId, notes) {
    fetch(`/api/admin/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: JSON.stringify({ notes })
    })
    .then(response => {
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
            loadRequests();
            loadDonations();
        } else {
            throw new Error('Failed to approve request');
        }
    })
    .catch(error => console.error('Error approving request:', error));
}

function rejectRequest(requestId, notes) {
    fetch(`/api/admin/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: JSON.stringify({ notes })
    })
    .then(response => {
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
            loadRequests();
        } else {
            throw new Error('Failed to reject request');
        }
    })
    .catch(error => console.error('Error rejecting request:', error));
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'AVAILABLE': return 'success';
        case 'RESERVED': return 'warning';
        case 'COLLECTED': return 'info';
        case 'DELIVERED': return 'primary';
        case 'EXPIRED': return 'danger';
        default: return 'secondary';
    }
}

function viewDonationDetails(donationId) {
    // Implement donation details view
    console.log('Viewing donation details:', donationId);
} 