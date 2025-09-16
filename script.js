// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        authenticateUser(username, password);
    } else {
        alert('Please fill in all fields');
    }
});

// Handle signup link
document.getElementById('signupLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Sign up functionality would be implemented here. For now, use any username/password to login.');
});

// Authentication function
function authenticateUser(username, password) {
    if (username.trim() && password.trim()) {
        sessionStorage.setItem('currentUser', username);
        window.location.href = '/dashboard';
    } else {
        alert('Please enter valid credentials');
    }
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser && window.location.pathname === '/') {
        window.location.href = '/dashboard';
    }
});