// Load pending requests
function loadPendingRequests() {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/requests/pending', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(donations => {
        const tableBody = document.querySelector('#pendingRequestsTable tbody');
        tableBody.innerHTML = '';

        if (donations.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">No pending requests found</td>';
            tableBody.appendChild(row);
            return;
        }

        donations.forEach(donation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${donation.donorName || 'Anonymous'}</td>
                <td>${donation.foodType}</td>
                <td>${donation.foodName}</td>
                <td>${donation.quantity} ${donation.quantityUnit}</td>
                <td>${formatDate(donation.requestedDate)}</td>
                <td>
                    <button onclick="approveDonation('${donation.id}')" class="btn btn-success btn-sm btn-action">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button onclick="rejectDonation('${donation.id}')" class="btn btn-danger btn-sm btn-action ms-2">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        showError('Failed to load pending requests: ' + error.message);
    });
}

function approveDonation(donationId) {
    if (!confirm('Are you sure you want to approve this request?')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    fetch(`/api/admin/requests/${donationId}/approve`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Approved by admin' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to approve request');
        }
        return response.json();
    })
    .then(() => {
        showSuccess('Request approved successfully');
        loadPendingRequests();
        loadAllDonations();
    })
    .catch(error => {
        showError('Failed to approve request: ' + error.message);
    });
}

function rejectDonation(donationId) {
    if (!confirm('Are you sure you want to reject this request?')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    fetch(`/api/admin/requests/${donationId}/reject`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Rejected by admin' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to reject request');
        }
        return response.json();
    })
    .then(() => {
        showSuccess('Request rejected successfully');
        loadPendingRequests();
        loadAllDonations();
    })
    .catch(error => {
        showError('Failed to reject request: ' + error.message);
    });
}

// Load organizations
function loadOrganizations() {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/organizations', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(organizations => {
        const tableBody = document.querySelector('#organizationsTable tbody');
        tableBody.innerHTML = '';

        if (organizations.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">No organizations found</td>';
            tableBody.appendChild(row);
            return;
        }

        organizations.forEach(org => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${org.name}</td>
                <td>${org.email}</td>
                <td>${org.phone || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        showError('Failed to load organizations: ' + error.message);
    });
}

// Load all donations
function loadAllDonations() {
    const token = localStorage.getItem('adminToken');
    fetch('/api/admin/donations', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(donations => {
        const tableBody = document.querySelector('#allDonationsTable tbody');
        tableBody.innerHTML = '';

        if (donations.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">No donations found</td>';
            tableBody.appendChild(row);
            return;
        }

        donations.forEach(donation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${donation.donorName || 'Anonymous'}</td>
                <td>${donation.foodType}</td>
                <td>${donation.foodName}</td>
                <td>${donation.quantity} ${donation.quantityUnit}</td>
                <td><span class="badge ${getStatusBadgeClass(donation.status)}">${donation.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        showError('Failed to load donations: ' + error.message);
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1050';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Show action modal
function showActionModal(requestId) {
    document.getElementById('requestId').value = requestId;
    document.getElementById('notes').value = '';
    new bootstrap.Modal(document.getElementById('requestActionModal')).show();
}

// Helper functions
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-US');
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'AVAILABLE':
            return 'bg-primary';
        case 'RESERVED':
            return 'bg-warning';
        case 'DONATED':
            return 'bg-success';
        case 'REJECTED':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Show/hide sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');

    // Update active state of nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Load section data
    if (sectionName === 'organizations') {
        loadOrganizations();
    } else if (sectionName === 'requests') {
        loadPendingRequests();
    } else if (sectionName === 'donations') {
        loadAllDonations();
    }
}

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin.html';
        return;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin.html';
        return;
    }

    loadPendingRequests();
    loadAllDonations();
    loadOrganizations();

    // Set up interval to refresh data
    setInterval(() => {
        const activeSection = document.querySelector('.section.active')?.id;
        if (activeSection === 'requests-section') {
            loadPendingRequests();
        } else if (activeSection === 'donations-section') {
            loadAllDonations();
        }
    }, 30000); // Refresh every 30 seconds
});

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin.html';
} 