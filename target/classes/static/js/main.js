document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('organizationForm');
    const formMessage = document.getElementById('formMessage');
    const registrationSuccessModal = document.getElementById('registrationSuccessModal');
    const goDashboardBtn = document.getElementById('goDashboardBtn');

    if (!form) return; // Prevents errors if form is missing

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            formMessage.textContent = "Please fill all required fields correctly.";
            formMessage.className = "mt-3 text-center text-danger";
            return;
        }

        // Gather form data
        const organization = {
            name: document.getElementById('orgName').value.trim(),
            type: document.getElementById('orgType').value,
            email: document.getElementById('orgEmail').value.trim(),
            password: document.getElementById('orgPassword').value.trim(),
            phone: document.getElementById('orgPhone').value.trim(),
            address: document.getElementById('orgAddress').value.trim(),
            description: document.getElementById('orgDescription').value.trim()
        };

        // Disable submit button to prevent double submissions
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        formMessage.textContent = "Registering...";
        formMessage.className = "mt-3 text-center text-info";

        fetch('/api/organizations/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(organization)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text || 'Registration failed'); });
            }
            return response.json();
        })
        .then(data => {
            formMessage.textContent = "";
            formMessage.className = "mt-3 text-center";
            form.reset();
            form.classList.remove('was-validated');
            localStorage.setItem('organizationId', data.id);

            // Show success modal if it exists, else redirect directly
            if (registrationSuccessModal && goDashboardBtn) {
                const modal = new bootstrap.Modal(registrationSuccessModal);
                modal.show();

                goDashboardBtn.onclick = function() {
                    window.location.href = "dashboard.html";
                };

                registrationSuccessModal.addEventListener('shown.bs.modal', function () {
                    goDashboardBtn.focus();
                }, { once: true });
            } else {
                window.location.href = "dashboard.html";
            }
        })
        .catch(error => {
            formMessage.textContent = error.message;
            formMessage.className = "mt-3 text-center text-danger";
        })
        .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
        });
    });
});
