document.addEventListener('DOMContentLoaded', function() {
    // Get organization ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const organizationId = urlParams.get('id') || localStorage.getItem('organizationId');
    
    if (!organizationId) {
        // No organization ID found, redirect to registration
        alert('No organization selected. Please register or log in.');
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize the page with organization data
    loadOrganizationData(organizationId);
    loadDonations(organizationId);
    loadAvailableDonations(organizationId);
    
    // Initialize navigation
    initNavigation();
    
    // Initialize chart
    initDonationChart();
    
    // Set up event listeners for various interactions
    setupEventListeners(organizationId);
});

// --- DATA LOADING FUNCTIONS ---

function loadOrganizationData(organizationId) {
    showLoader();
    
    fetch(`/api/organizations/${organizationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load organization data');
            }
            return response.json();
        })
        .then(data => {
            // Update organization info in the sidebar
            document.getElementById('orgName').textContent = data.name;
            document.getElementById('orgType').textContent = data.type;
            
            // Update profile section
            document.getElementById('profileOrgName').textContent = data.name;
            document.getElementById('profileOrgType').textContent = data.type;
            document.getElementById('profileEmail').textContent = data.email;
            document.getElementById('profilePhone').textContent = data.phone;
            document.getElementById('profileAddress').textContent = data.address;
            document.getElementById('profileDescription').textContent = data.description || 'No description available.';
            
            // Format registration date
            const regDate = new Date(data.registrationDate);
            document.getElementById('profileActiveSince').textContent = regDate.toLocaleDateString();
            
            // Populate the edit form
            document.getElementById('editName').value = data.name;
            document.getElementById('editEmail').value = data.email;
            document.getElementById('editPhone').value = data.phone;
            document.getElementById('editAddress').value = data.address;
            document.getElementById('editDescription').value = data.description || '';
            
            hideLoader();
        })
        .catch(error => {
            console.error('Error loading organization data:', error);
            hideLoader();
            showAlert('danger', 'Failed to load organization data. Please refresh the page.');
        });
}

function loadDonations(organizationId) {
    showLoader();
    
    fetch(`/api/donations/organization/${organizationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load donations');
            }
            return response.json();
        })
        .then(donations => {
            // Update statistics in dashboard overview
            document.getElementById('totalDonations').textContent = donations.length;
            document.getElementById('profileTotalDonations').textContent = donations.length;
            
            const activeDonations = donations.filter(d => d.status === 'AVAILABLE' || d.status === 'RESERVED').length;
            document.getElementById('activeDonations').textContent = activeDonations;
            
            // Calculate expiring soon (within 2 days)
            const today = new Date();
            const twoDaysLater = new Date();
            twoDaysLater.setDate(today.getDate() + 2);
            
            const expiringSoon = donations.filter(d => {
                const expiryDate = new Date(d.expiryDate);
                return expiryDate <= twoDaysLater && expiryDate >= today && d.status === 'AVAILABLE';
            }).length;
            
            document.getElementById('expiringSoon').textContent = expiringSoon;
            
            // Estimate people helped (for demonstration - in real app would be more accurate)
            const peopleHelped = Math.floor(donations.filter(d => d.status === 'DELIVERED').length * 4.5);
            document.getElementById('peopleHelped').textContent = peopleHelped;
            document.getElementById('profileImpactScore').textContent = peopleHelped;
            
            // Populate donations table
            populateDonationsTable(donations);
            
            // Populate recent activity
            populateRecentActivity(donations);
            
            // Update donation chart
            updateDonationChart(donations);
            
            hideLoader();
        })
        .catch(error => {
            console.error('Error loading donations:', error);
            hideLoader();
            showAlert('danger', 'Failed to load donations. Please refresh the page.');
        });
}

function loadAvailableDonations(organizationId) {
    showLoader();
    
    fetch(`/api/donations/available/${organizationId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText || 'Failed to load available donations');
            }
            return response.json();
        })
        .then(donations => {
            populateAvailableDonationsTable(donations);
            hideLoader();
        })
        .catch(error => {
            console.error('Error loading available donations:', error);
            hideLoader();
            showAlert('danger', 'Failed to load available donations: ' + error.message);
        });
}

function loadDonationRequests(organizationId) {
    showLoader();
    
    fetch(`/api/donations/requests/${organizationId}`)
        .then(response => {
            if (!response.ok) {
                // If API is not implemented yet, use mock data
                return mockDonationRequests(organizationId);
            }
            return response.json();
        })
        .then(requests => {
            populateRequestsTable(requests);
            hideLoader();
        })
        .catch(error => {
            console.error('Error loading donation requests:', error);
            // Use mock data if API fails
            populateRequestsTable(mockDonationRequests(organizationId));
            hideLoader();
        });
}

// --- UI POPULATION FUNCTIONS ---

function populateDonationsTable(donations) {
    const tableBody = document.getElementById('donationsTableBody');
    tableBody.innerHTML = '';
    
    if (donations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <p class="mb-0 text-muted">You haven't made any donations yet</p>
                    <button class="btn btn-sm btn-primary mt-2" id="emptyStateDonateBtn">
                        <i class="bi bi-plus-circle me-1"></i> Make Your First Donation
                    </button>
                </td>
            </tr>
        `;
        
        // Add event listener to the button
        document.getElementById('emptyStateDonateBtn').addEventListener('click', function() {
            new bootstrap.Modal(document.getElementById('donationModal')).show();
        });
        
        return;
    }
    
    // Sort donations by date, newest first
    donations.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));
    
    donations.forEach(donation => {
        const row = document.createElement('tr');
        
        // Food Type
        const typeCell = document.createElement('td');
        typeCell.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="ms-1">
                    <strong>${donation.foodName}</strong><br>
                    <small class="text-muted">${formatFoodType(donation.foodType)}</small>
                </div>
            </div>
        `;
        
        // Quantity
        const quantityCell = document.createElement('td');
        quantityCell.textContent = `${donation.quantity} ${donation.quantityUnit}`;
        
        // Expiry Date
        const expiryCell = document.createElement('td');
        const expiryDate = new Date(donation.expiryDate);
        expiryCell.textContent = expiryDate.toLocaleDateString();
        
        // Pickup Address
        const addressCell = document.createElement('td');
        addressCell.textContent = donation.pickupAddress;
        
        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="badge badge-${donation.status.toLowerCase()}">${donation.status}</span>`;
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-1 view-donation" data-id="${donation.id}">
                <i class="bi bi-eye"></i>
            </button>
            ${donation.status === 'AVAILABLE' ? `
                <button class="btn btn-sm btn-outline-danger cancel-donation" data-id="${donation.id}">
                    <i class="bi bi-x-circle"></i>
                </button>
            ` : ''}
        `;
        
        // Append cells to row
        row.appendChild(typeCell);
        row.appendChild(quantityCell);
        row.appendChild(expiryCell);
        row.appendChild(addressCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        
        // Append row to table body
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the view and cancel buttons
    document.querySelectorAll('.view-donation').forEach(button => {
        button.addEventListener('click', function() {
            const donationId = this.getAttribute('data-id');
            viewDonationDetails(donationId, donations);
        });
    });
    
    document.querySelectorAll('.cancel-donation').forEach(button => {
        button.addEventListener('click', function() {
            const donationId = this.getAttribute('data-id');
            cancelDonation(donationId);
        });
    });
}

function populateRequestsTable(requests) {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    
    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <p class="text-muted mb-0">No donation requests at the moment</p>
                </td>
            </tr>
        `;
        return;
    }
    
    requests.forEach(request => {
        const row = document.createElement('tr');
        
        // Request ID
        const idCell = document.createElement('td');
        idCell.textContent = request.id;
        
        // Organization
        const orgCell = document.createElement('td');
        orgCell.textContent = request.requesterName;
        
        // Food Type
        const typeCell = document.createElement('td');
        typeCell.textContent = formatFoodType(request.foodType);
        
        // Requested Date
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(request.requestDate).toLocaleDateString();
        
        // Status
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `<span class="badge bg-${getStatusClass(request.status)}">${request.status}</span>`;
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-1 view-request" data-id="${request.id}">
                <i class="bi bi-eye"></i>
            </button>
            ${request.status === 'PENDING' ? `
                <button class="btn btn-sm btn-outline-success me-1 approve-request" data-id="${request.id}">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger reject-request" data-id="${request.id}">
                    <i class="bi bi-x-circle"></i>
                </button>
            ` : ''}
        `;
        
        // Append cells to row
        row.appendChild(idCell);
        row.appendChild(orgCell);
        row.appendChild(typeCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        
        // Append row to table body
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    // These would need to be implemented based on your API
}

function populateRecentActivity(donations) {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';
    
    if (donations.length === 0) {
        activityList.innerHTML = '<li class="timeline-item">No activity yet</li>';
        return;
    }
    
    // Sort by donation date and take the 5 most recent
    const recentDonations = [...donations]
        .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
        .slice(0, 5);
    
    recentDonations.forEach(donation => {
        const activityDate = new Date(donation.donationDate);
        const today = new Date();
        
        // Format relative time
        let timeAgo;
        const diffTime = Math.abs(today - activityDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            timeAgo = 'Today';
        } else if (diffDays === 1) {
            timeAgo = 'Yesterday';
        } else {
            timeAgo = `${diffDays} days ago`;
        }
        
        // Create activity item
        const li = document.createElement('li');
        li.className = 'timeline-item';
        li.innerHTML = `
            <div><strong>${donation.foodName}</strong> (${donation.quantity} ${donation.quantityUnit}) was ${getActivityText(donation.status)}</div>
            <div class="text-muted small">${timeAgo} - ${activityDate.toLocaleTimeString()}</div>
        `;
        
        activityList.appendChild(li);
    });
}

function populateAvailableDonationsTable(donations) {
    const tableBody = document.getElementById('availableDonationsTableBody');
    tableBody.innerHTML = '';
    
    if (donations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <p class="mb-0 text-muted">No donations available at the moment</p>
                </td>
            </tr>
        `;
        return;
    }
    
    donations.forEach(donation => {
        const row = document.createElement('tr');
        
        // Organization
        const orgCell = document.createElement('td');
        orgCell.textContent = donation.donorName;
        
        // Food Type
        const typeCell = document.createElement('td');
        typeCell.textContent = formatFoodType(donation.foodType);
        
        // Food Name
        const nameCell = document.createElement('td');
        nameCell.textContent = donation.foodName;
        
        // Quantity
        const quantityCell = document.createElement('td');
        quantityCell.textContent = `${donation.quantity} ${donation.quantityUnit}`;
        
        // Expiry Date
        const expiryCell = document.createElement('td');
        const expiryDate = new Date(donation.expiryDate);
        expiryCell.textContent = expiryDate.toLocaleDateString();
        
        // Location
        const locationCell = document.createElement('td');
        locationCell.textContent = donation.pickupAddress;
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="btn btn-sm btn-outline-primary me-1 view-available-donation" data-id="${donation.id}">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-success request-donation" data-id="${donation.id}">
                <i class="bi bi-hand-index-thumb"></i>
            </button>
        `;
        
        // Append cells to row
        row.appendChild(orgCell);
        row.appendChild(typeCell);
        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(expiryCell);
        row.appendChild(locationCell);
        row.appendChild(actionsCell);
        
        // Append row to table body
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the view and request buttons
    document.querySelectorAll('.view-available-donation').forEach(button => {
        button.addEventListener('click', function() {
            const donationId = this.getAttribute('data-id');
            viewDonationDetails(donationId, donations);
        });
    });
    
    document.querySelectorAll('.request-donation').forEach(button => {
        button.addEventListener('click', function() {
            const donationId = this.getAttribute('data-id');
            requestDonation(donationId);
        });
    });
}

// --- CHART FUNCTIONS ---

function initDonationChart() {
    const ctx = document.getElementById('donationChart').getContext('2d');
    
    window.donationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Donations',
                data: [],
                backgroundColor: 'rgba(13, 110, 253, 0.6)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Donations'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            }
        }
    });
}

function updateDonationChart(donations) {
    // Process donation data by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    donations.forEach(donation => {
        const date = new Date(donation.donationDate);
        const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear]++;
    });
    
    // Convert to arrays for chart
    const labels = Object.keys(monthlyData).sort((a, b) => {
        const aDate = new Date(a);
        const bDate = new Date(b);
        return aDate - bDate;
    });
    
    const data = labels.map(label => monthlyData[label]);
    
    // Update chart
    window.donationChart.data.labels = labels;
    window.donationChart.data.datasets[0].data = data;
    window.donationChart.update();
}

// --- EVENT LISTENER SETUP ---

function setupEventListeners(organizationId) {
    // Tab navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            activateSection(sectionId);
        });
    });
    
    // New donation buttons
    document.getElementById('newDonationBtn').addEventListener('click', function() {
        new bootstrap.Modal(document.getElementById('donationModal')).show();
    });
    
    document.getElementById('newDonationBtnAlt').addEventListener('click', function() {
        new bootstrap.Modal(document.getElementById('donationModal')).show();
    });
    
    // Submit donation
    document.getElementById('submitDonation').addEventListener('click', function() {
        submitDonation(organizationId);
    });
    
    // Edit profile
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        document.getElementById('editProfileForm').style.display = 'block';
    });
    
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        document.getElementById('editProfileForm').style.display = 'none';
    });
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateOrganizationProfile(organizationId);
    });
    
    // Donation form - set today as min date for expiry
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expiryDate').setAttribute('min', today);
    
    // Donation search
    document.getElementById('donationSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#donationsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// --- FORM SUBMISSION FUNCTIONS ---

function submitDonation(organizationId) {
    const foodType = document.getElementById('foodType').value;
    const foodName = document.getElementById('foodName').value;
    const quantity = document.getElementById('quantity').value;
    const quantityUnit = document.getElementById('quantityUnit').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const pickupAddress = document.getElementById('pickupAddress').value;
    const contactPhone = document.getElementById('contactPhone').value;
    const requiresRefrigeration = document.getElementById('refrigeration').checked;
    const notes = document.getElementById('notes').value;
    
    // Validate form
    if (!foodType || !foodName || !quantity || !expiryDate || !pickupAddress || !contactPhone) {
        showAlert('danger', 'Please fill in all required fields');
        return;
    }
    
    // Prepare donation data
    const donation = {
        organizationId: organizationId,
        donorName: document.getElementById('donorName').value || 'Anonymous',
        foodType: foodType,
        foodName: foodName,
        quantity: quantity.toString(),
        quantityUnit: quantityUnit,
        expiryDate: new Date(expiryDate).toISOString(),
        pickupAddress: pickupAddress,
        contactPhone: contactPhone,
        requiresRefrigeration: requiresRefrigeration,
        notes: notes,
        status: 'AVAILABLE'
    };
    
    showLoader();
    
    // Submit donation
    fetch('/api/donations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(donation)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to submit donation');
            });
        }
        return response.json();
    })
    .then(data => {
        hideLoader();
        showAlert('success', 'Donation submitted successfully!');
        
        // Close modal and reset form
        bootstrap.Modal.getInstance(document.getElementById('donationModal')).hide();
        document.getElementById('donationForm').reset();
        
        // Reload donations
        loadDonations(organizationId);
    })
    .catch(error => {
        hideLoader();
        showAlert('danger', 'Failed to submit donation: ' + error.message);
    });
}

function updateOrganizationProfile(organizationId) {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    const description = document.getElementById('editDescription').value;
    
    // Validate form
    if (!name || !email || !phone || !address) {
        showAlert('danger', 'Please fill in all required fields');
        return;
    }
    
    // Prepare organization data
    const organization = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        description: description
    };
    
    showLoader();
    
    // Update organization
    fetch(`/api/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(organization)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        return response.json();
    })
    .then(data => {
        hideLoader();
        showAlert('success', 'Profile updated successfully!');
        
        // Hide form
        document.getElementById('editProfileForm').style.display = 'none';
        
        // Reload organization data
        loadOrganizationData(organizationId);
    })
    .catch(error => {
        hideLoader();
        showAlert('danger', 'Failed to update profile: ' + error.message);
    });
}

function viewDonationDetails(donationId, donations) {
    // Find the donation in the array
    const donation = donations.find(d => d.id === donationId);
    
    if (!donation) {
        showAlert('danger', 'Donation not found');
        return;
    }
    
    // Populate the modal
    const content = document.getElementById('donationDetailsContent');
    content.innerHTML = `
        <div class="mb-3">
            <label class="fw-bold">Food Name:</label>
            <div>${donation.foodName}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Food Type:</label>
            <div>${formatFoodType(donation.foodType)}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Quantity:</label>
            <div>${donation.quantity} ${donation.quantityUnit}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Expiry Date:</label>
            <div>${new Date(donation.expiryDate).toLocaleDateString()}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Pickup Address:</label>
            <div>${donation.pickupAddress}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Contact Phone:</label>
            <div>${donation.contactPhone}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Refrigeration Required:</label>
            <div>${donation.requiresRefrigeration ? 'Yes' : 'No'}</div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Status:</label>
            <div><span class="badge badge-${donation.status.toLowerCase()}">${donation.status}</span></div>
        </div>
        <div class="mb-3">
            <label class="fw-bold">Donation Date:</label>
            <div>${new Date(donation.donationDate).toLocaleString()}</div>
        </div>
        ${donation.notes ? `
        <div class="mb-3">
            <label class="fw-bold">Notes:</label>
            <div>${donation.notes}</div>
        </div>
        ` : ''}
    `;
    
    // Show modal
    new bootstrap.Modal(document.getElementById('viewDonationModal')).show();
}

function cancelDonation(donationId) {
    if (!confirm('Are you sure you want to cancel this donation?')) {
        return;
    }
    
    showLoader();
    
    fetch(`/api/donations/${donationId}/cancel`, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to cancel donation');
        }
        return response.json();
    })
    .then(data => {
        hideLoader();
        showAlert('success', 'Donation cancelled successfully');
        
        // Reload donations
        const organizationId = new URLSearchParams(window.location.search).get('id') || localStorage.getItem('organizationId');
        loadDonations(organizationId);
    })
    .catch(error => {
        hideLoader();
        showAlert('danger', 'Failed to cancel donation: ' + error.message);
    });
}

function requestDonation(donationId) {
    if (!confirm('Would you like to request this donation?')) {
        return;
    }
    
    const organizationId = new URLSearchParams(window.location.search).get('id') || localStorage.getItem('organizationId');
    
    showLoader();
    
    fetch(`/api/donations/${donationId}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            organizationId: organizationId
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to request donation');
            });
        }
        return response.json();
    })
    .then(data => {
        hideLoader();
        showAlert('success', 'Donation request submitted successfully!');
        loadAvailableDonations(organizationId);
    })
    .catch(error => {
        hideLoader();
        showAlert('danger', 'Failed to request donation: ' + error.message);
    });
}

// --- HELPER FUNCTIONS ---

function mockDonationRequests(organizationId) {
    // This is a helper function to generate mock data for the donation requests
    // In a real application, this would come from your API
    return [
        {
            id: 'req-001',
            requesterName: 'Food Bank Organization',
            foodType: 'GRAINS',
            requestDate: new Date().toISOString(),
            status: 'PENDING'
        },
        {
            id: 'req-002',
            requesterName: 'Community Kitchen',
            foodType: 'FRUITS_VEGETABLES',
            requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'APPROVED'
        },
        {
            id: 'req-003',
            requesterName: 'Homeless Shelter',
            foodType: 'PREPARED_MEALS',
            requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'REJECTED'
        }
    ];
}

function initNavigation() {
    // Initialize with dashboard overview section
    activateSection('overview');
}

function activateSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`.nav-link[data-section="${sectionId}"]`).classList.add('active');
}

function formatFoodType(foodType) {
    if (!foodType) return '';
    
    return foodType
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function getStatusClass(status) {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        default: return 'secondary';
    }
}

function getActivityText(status) {
    switch (status) {
        case 'AVAILABLE': return 'made available for donation';
        case 'RESERVED': return 'reserved by an organization';
        case 'COLLECTED': return 'collected for distribution';
        case 'DELIVERED': return 'delivered to recipients';
        case 'EXPIRED': return 'marked as expired';
        default: return status.toLowerCase();
    }
}

function showLoader() {
    // You could implement a loading spinner here
    // For simplicity, we'll just log to console
    console.log('Loading...');
}

function hideLoader() {
    console.log('Loading complete');
}

function showAlert(type, message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = 1050;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}
