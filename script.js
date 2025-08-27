// Global variables
let currentUser = null;
let balance = 100000;
let transactionType = '';
let balanceVisible = true;

// DOM elements
const preloader = document.getElementById('preloader');
const homePage = document.getElementById('homePage');
const dashboard = document.getElementById('dashboard');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const transactionModal = document.getElementById('transactionModal');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.getElementById('nav');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader after 3 seconds
    setTimeout(() => {
        preloader.style.display = 'none';
        checkAuthStatus();
    }, 3000);

    // Event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    checkAuthStatus();
});

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Auth buttons
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('signupBtn').addEventListener('click', () => openModal('signupModal'));
    document.getElementById('getStartedBtn').addEventListener('click', () => openModal('signupModal'));
    document.getElementById('learnMoreBtn').addEventListener('click', () => {
        document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('transactionForm').addEventListener('submit', handleTransaction);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    nav.classList.toggle('active');
    const icon = mobileMenuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
}

// Check authentication status
function checkAuthStatus() {
    const userData = localStorage.getItem('blueZenithUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        showDashboard();
    } else {
        showHomePage();
    }
}

// Show home page
function showHomePage() {
    homePage.style.display = 'block';
    dashboard.style.display = 'none';
    
    // Update header for non-logged-in users
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.style.display = 'flex';
}

// Show dashboard
function showDashboard() {
    homePage.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Update header for logged-in users
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.style.display = 'none';
    
    // Display user name
    document.getElementById('userName').textContent = currentUser.name;
    
    // Load user data
    loadUserData();
    loadTransactions();
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('blueZenithUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('blueZenithUser', JSON.stringify(user));
            closeModal('loginModal');
            showDashboard();
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid email or password!', 'error');
        }
    } else {
        showNotification('Please fill in all fields!', 'error');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (name && email && password) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('blueZenithUsers') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showNotification('User with this email already exists!', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            balance: 100000,
            transactions: []
        };
        
        users.push(newUser);
        localStorage.setItem('blueZenithUsers', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('blueZenithUser', JSON.stringify(newUser));
        
        closeModal('signupModal');
        showDashboard();
        showNotification('Account created successfully!', 'success');
    } else {
        showNotification('Please fill in all fields!', 'error');
    }
}

// Handle logout
function logout() {
    currentUser = null;
    localStorage.removeItem('blueZenithUser');
    showHomePage();
    showNotification('Logged out successfully!', 'success');
}

// Load user data
function loadUserData() {
    if (currentUser) {
        balance = currentUser.balance || 100000;
        updateBalanceDisplay();
    }
}

// Update balance display
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceVisible) {
        balanceElement.textContent = balance.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        balanceElement.textContent = '****';
    }
}

// Toggle balance visibility
function toggleBalance() {
    balanceVisible = !balanceVisible;
    const icon = document.getElementById('balanceToggleIcon');
    icon.className = balanceVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
    updateBalanceDisplay();
}

// Open transaction modal
function openTransaction(type) {
    transactionType = type;
    document.getElementById('modalTitle').textContent = type + ' Money';
    openModal('transactionModal');
}

// Handle transaction
function handleTransaction(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Please enter a valid amount!', 'error');
        return;
    }
    
    let success = false;
    let newBalance = balance;
    
    switch (transactionType) {
        case 'Withdraw':
        case 'Transfer':
            if (amount > balance) {
                showNotification('Insufficient funds!', 'error');
                return;
            }
            newBalance = balance - amount;
            success = true;
            break;
            
        case 'Deposit':
            newBalance = balance + amount;
            success = true;
            break;
            
        default:
            showNotification('Invalid transaction type!', 'error');
            return;
    }
    
    if (success) {
        balance = newBalance;
        
        // Update user data
        currentUser.balance = balance;
        const transaction = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            type: transactionType,
            amount: transactionType === 'Deposit' ? amount : -amount,
            balance: balance
        };
        
        currentUser.transactions = currentUser.transactions || [];
        currentUser.transactions.unshift(transaction);
        
        // Save to localStorage
        localStorage.setItem('blueZenithUser', JSON.stringify(currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('blueZenithUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('blueZenithUsers', JSON.stringify(users));
        }
        
        updateBalanceDisplay();
        addTransactionToTable(transaction);
        closeModal('transactionModal');
        document.getElementById('amount').value = '';
        
        showNotification(`${transactionType} successful!`, 'success');
    }
}

// Load transactions
function loadTransactions() {
    const transactionsBody = document.getElementById('transactionsBody');
    transactionsBody.innerHTML = '';
    
    if (currentUser && currentUser.transactions) {
        currentUser.transactions.slice(0, 10).forEach(transaction => {
            addTransactionToTable(transaction);
        });
    }
}

// Add transaction to table
function addTransactionToTable(transaction) {
    const transactionsBody = document.getElementById('transactionsBody');
    const row = document.createElement('tr');
    
    const amountDisplay = transaction.amount > 0 
        ? `+₦${Math.abs(transaction.amount).toLocaleString()}` 
        : `-₦${Math.abs(transaction.amount).toLocaleString()}`;
    
    const amountClass = transaction.amount > 0 ? 'text-success' : 'text-danger';
    
    row.innerHTML = `
        <td>${transaction.date}</td>
        <td>${transaction.type}</td>
        <td class="${amountClass}">${amountDisplay}</td>
        <td>₦${transaction.balance.toLocaleString()}</td>
    `;
    
    transactionsBody.insertBefore(row, transactionsBody.firstChild);
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Clear form inputs
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Switch between login and signup modals
function switchToSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

function switchToLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add some sample transactions for demo purposes
function addSampleTransactions() {
    if (currentUser && (!currentUser.transactions || currentUser.transactions.length === 0)) {
        const sampleTransactions = [
            {
                id: Date.now() - 1000,
                date: new Date(Date.now() - 86400000).toLocaleDateString(),
                type: 'Deposit',
                amount: 50000,
                balance: 150000
            },
            {
                id: Date.now() - 2000,
                date: new Date(Date.now() - 172800000).toLocaleDateString(),
                type: 'Transfer',
                amount: -25000,
                balance: 100000
            },
            {
                id: Date.now() - 3000,
                date: new Date(Date.now() - 259200000).toLocaleDateString(),
                type: 'Withdraw',
                amount: -10000,
                balance: 125000
            }
        ];
        
        currentUser.transactions = sampleTransactions;
        localStorage.setItem('blueZenithUser', JSON.stringify(currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('blueZenithUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('blueZenithUsers', JSON.stringify(users));
        }
    }
}

// Initialize sample data on first load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (currentUser) {
            addSampleTransactions();
            loadTransactions();
        }
    }, 1000);
});