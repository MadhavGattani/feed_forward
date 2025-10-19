document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    if (loginForm) {
        console.log('Login form found, attaching submit handler');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submission started');
            
            loginMessage.textContent = "Signing in...";
            loginMessage.className = "mt-3 text-center text-info";
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            fetch('/api/organizations/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Invalid email or password');
                    } else {
                        return response.text().then(text => {
                            throw new Error(text || 'Login failed');
                        });
                    }
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful');
                loginMessage.textContent = "Login successful!";
                loginMessage.className = "mt-3 text-center text-success";
                
                // Store organization ID
                localStorage.setItem('organizationId', data.id);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html?id=' + data.id;
            })
            .catch(error => {
                console.error('Error:', error);
                loginMessage.textContent = error.message;
                loginMessage.className = "mt-3 text-center text-danger";
            });
        });
    } else {
        console.warn('Login form not found on this page');
    }
});
