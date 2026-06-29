// Constants
const STAFF_PASSWORD = 'staff123';
const STORAGE_KEY = 'cafeOrders';
const POLL_INTERVAL = 2000;

// State
let orders = [];
let currentOrderNumber = 1;
let pollInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    setupEventListeners();
});

// Navigation
function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');

    if (pageName === 'dashboardPage') {
        startPolling();
        refreshOrders();
    } else {
        stopPolling();
    }
}

// Order Management
function placeOrder(item) {
    const button = document.querySelector('.order-button:disabled') || event.target.closest('.order-button');
    if (!button) return;
    button.disabled = true;

    const submittingIndicator = document.getElementById('submittingIndicator');
    submittingIndicator.style.display = 'flex';

    // Simulate API delay
    setTimeout(() => {
        const order = {
            id: Date.now(),
            orderNumber: currentOrderNumber,
            item: item,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        orders.push(order);
        currentOrderNumber++;
        saveOrders();

        // Show confirmation popup
        showConfirmationPopup(order.orderNumber, item);

        // Reset UI
        button.disabled = false;
        submittingIndicator.style.display = 'none';
    }, 500);
}

function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statusProgression = {
        'Pending': 'Ready',
        'Ready': 'Completed',
        'Completed': 'Completed'
    };

    order.status = statusProgression[order.status];
    saveOrders();
    refreshOrders();
    showToast(`Order #${order.orderNumber} status updated to ${order.status}`, 'success');
}

function clearOrder(orderId) {
    orders = orders.filter(o => o.id !== orderId);
    saveOrders();
    refreshOrders();
    showToast('Order cleared', 'success');
}

// Dashboard
function refreshOrders() {
    const activeOrders = orders.filter(o => o.status !== 'Completed');
    const completedOrders = orders.filter(o => o.status === 'Completed');

    // Update active orders
    const activeContainer = document.getElementById('activeOrdersContainer');
    if (activeOrders.length === 0) {
        activeContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">☕</div>
                <p>No active orders. Start taking orders to see them here.</p>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeOrders.map(order => createOrderCard(order, false)).join('');
    }

    // Update completed orders
    const completedSection = document.getElementById('completedSection');
    const completedContainer = document.getElementById('completedOrdersContainer');

    if (completedOrders.length > 0) {
        completedSection.style.display = 'block';
        completedContainer.innerHTML = completedOrders.map(order => createOrderCard(order, true)).join('');
    } else {
        completedSection.style.display = 'none';
    }

    // Update counts
    document.getElementById('activeCount').textContent = activeOrders.length;
    document.getElementById('completedCount').textContent = completedOrders.length;
}

function createOrderCard(order, isCompleted) {
    const itemIcon = order.item === 'Latte' ? '☕' : '❤️';
    const statusClass = `status-${order.status.toLowerCase()}`;
    const statusIcon = order.status === 'Pending' ? '⏱️' : order.status === 'Ready' ? '✓' : '✓';

    const timestamp = new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const statusButtonLabel = order.status === 'Pending' ? 'Mark Ready' : 
                             order.status === 'Ready' ? 'Mark Completed' : 
                             'Completed';

    return `
        <div class="order-card ${isCompleted ? 'completed' : ''}">
            <div class="order-header">
                <div class="order-number-badge">Order #${order.orderNumber}</div>
                <div class="status-badge ${statusClass}">
                    <span>${statusIcon}</span>
                    <span>${order.status}</span>
                </div>
            </div>
            <div class="order-item">
                <span>${itemIcon}</span>
                <span>${order.item}</span>
            </div>
            <div class="order-timestamp">${timestamp}</div>
            <div class="order-actions">
                ${!isCompleted ? `
                    <button class="action-button action-button-status" onclick="updateOrderStatus(${order.id})">
                        ✓ ${statusButtonLabel}
                    </button>
                ` : ''}
                <button class="action-button action-button-clear" onclick="clearOrder(${order.id})">
                    ✕ Clear Order
                </button>
            </div>
        </div>
    `;
}

// Password Protection
function showPasswordDialog() {
    document.getElementById('passwordDialog').style.display = 'flex';
    document.getElementById('passwordInput').focus();
    document.getElementById('passwordError').style.display = 'none';
}

function closePasswordDialog() {
    document.getElementById('passwordDialog').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
}

function verifyPassword() {
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('passwordError');

    if (password === STAFF_PASSWORD) {
        closePasswordDialog();
        navigateTo('dashboardPage');
    } else {
        errorElement.textContent = 'Incorrect password';
        errorElement.style.display = 'block';
        document.getElementById('passwordInput').value = '';
    }
}

function logout() {
    stopPolling();
    navigateTo('homePage');
}

// Confirmation Popup
function showConfirmationPopup(orderNumber, item) {
    const popup = document.getElementById('confirmationPopup');
    document.getElementById('confirmationOrderNumber').textContent = `#${orderNumber}`;
    document.getElementById('confirmationOrderItem').textContent = item;

    popup.style.display = 'flex';
    createConfetti();

    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';

    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';

        container.appendChild(confetti);
    }

    setTimeout(() => {
        container.innerHTML = '';
    }, 2500);
}

// Polling
function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(refreshOrders, POLL_INTERVAL);
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Storage
function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        orders: orders,
        currentOrderNumber: currentOrderNumber
    }));
}

function loadOrders() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            orders = parsed.orders || [];
            currentOrderNumber = parsed.currentOrderNumber || 1;
        } catch (error) {
            console.error('Failed to parse stored orders:', error);
            orders = [];
            currentOrderNumber = 1;
        }
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Close modal when clicking outside
    document.getElementById('passwordDialog').addEventListener('click', (e) => {
        if (e.target.id === 'passwordDialog') {
            closePasswordDialog();
        }
    });

    // Close confirmation popup when clicking outside
    document.getElementById('confirmationPopup').addEventListener('click', (e) => {
        if (e.target.id === 'confirmationPopup') {
            document.getElementById('confirmationPopup').style.display = 'none';
        }
    });
}
