/**
 * D'Xpress E-Commerce Platform
 * Core JavaScript Functionality
 * Author: MiniMax Agent
 * 
 * Features:
 * - Philippine Peso currency management
 * - Product catalog with search/filter
 * - Shopping cart and wishlist
 * - Real-time data simulation
 * - User authentication
 * - Order management
 */

// ========================================
// GLOBAL VARIABLES & CONFIGURATION
// ========================================

const EXCHANGE_RATE = 57; // USD to PHP exchange rate
const CURRENCY_FORMAT = 'en-PH'; // Philippines locale

// Product data - 12 premium products across 4 categories
const PRODUCTS = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        category: "Electronics",
        price: 899.99,
        description: "The latest iPhone with A17 Pro chip, titanium design, and pro camera system.",
        features: ["A17 Pro Chip", "Titanium Design", "Pro Camera", "120Hz Display"],
        stock: 25,
        rating: 4.9,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "MacBook Air M3",
        category: "Electronics",
        price: 1199.99,
        description: "Supercharged by M3 chip, up to 18 hours battery life, ultra-thin design.",
        features: ["M3 Chip", "18hr Battery", "MagSafe Charging", "Liquid Retina Display"],
        stock: 18,
        rating: 4.8,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "AirPods Pro 2",
        category: "Electronics",
        price: 249.99,
        description: "Active Noise Cancellation, Transparency mode, and spatial audio.",
        features: ["Active Noise Cancellation", "Spatial Audio", "6hr Battery", "MagSafe Case"],
        stock: 45,
        rating: 4.7,
        reviews: 234,
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        name: "Designer Denim Jacket",
        category: "Fashion",
        price: 189.99,
        description: "Premium selvedge denim jacket with vintage-inspired wash and modern fit.",
        features: ["Selvedge Denim", "Vintage Wash", "Modern Fit", "Premium Buttons"],
        stock: 32,
        rating: 4.6,
        reviews: 67,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        name: "Luxury Leather Handbag",
        category: "Fashion",
        price: 399.99,
        description: "Genuine Italian leather handbag with gold-tone hardware and multiple compartments.",
        features: ["Italian Leather", "Gold Hardware", "Multiple Compartments", "Adjustable Strap"],
        stock: 22,
        rating: 4.8,
        reviews: 143,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        name: "Cashmere Sweater",
        category: "Fashion",
        price: 299.99,
        description: "100% pure cashmere sweater in classic cut, incredibly soft and warm.",
        features: ["100% Cashmere", "Classic Cut", "Ultra Soft", "Temperature Regulating"],
        stock: 28,
        rating: 4.9,
        reviews: 92,
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop"
    },
    {
        id: 7,
        name: "Smart Home Hub",
        category: "Home & Living",
        price: 149.99,
        description: "Control all your smart home devices from one central hub with voice commands.",
        features: ["Voice Control", "Multi-Device Support", "App Control", "Privacy Focus"],
        stock: 35,
        rating: 4.5,
        reviews: 178,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        name: "Ergonomic Office Chair",
        category: "Home & Living",
        price: 599.99,
        description: "Premium ergonomic office chair with lumbar support and adjustable height.",
        features: ["Lumbar Support", "Adjustable Height", "Breathable Mesh", "5-Year Warranty"],
        stock: 15,
        rating: 4.7,
        reviews: 201,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
    },
    {
        id: 9,
        name: "Smart LED Mirror",
        category: "Home & Living",
        price: 249.99,
        description: "Touchscreen LED mirror with Bluetooth, dimming, and weather display.",
        features: ["Touchscreen", "Bluetooth", "Dimming Control", "Weather Display"],
        stock: 20,
        rating: 4.4,
        reviews: 76,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
    },
    {
        id: 10,
        name: "Gold Chain Necklace",
        category: "Accessories",
        price: 499.99,
        description: "14K gold-plated chain necklace with adjustable length and secure clasp.",
        features: ["14K Gold Plated", "Adjustable Length", "Secure Clasp", "Hypoallergenic"],
        stock: 40,
        rating: 4.8,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop"
    },
    {
        id: 11,
        name: "Leather Watch Band",
        category: "Accessories",
        price: 89.99,
        description: "Genuine leather watch band compatible with Apple Watch and other smartwatches.",
        features: ["Genuine Leather", "Universal Fit", "Quick Release", "Weather Resistant"],
        stock: 55,
        rating: 4.6,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop"
    },
    {
        id: 12,
        name: "Titanium Sunglasses",
        category: "Accessories",
        price: 199.99,
        description: "Ultra-lightweight titanium frame with polarized lenses and UV protection.",
        features: ["Titanium Frame", "Polarized Lenses", "UV Protection", "Ultra Lightweight"],
        stock: 30,
        rating: 4.7,
        reviews: 165,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop"
    }
];

// Promo codes
const PROMO_CODES = {
    'SAVE10': { type: 'percentage', value: 10, description: 'Get 10% off your order' },
    'SAVE20': { type: 'percentage', value: 20, description: 'Get 20% off your order' },
    'FLAT50': { type: 'fixed', value: 50, description: 'Get ₱50 off your order' },
    'WELCOME': { type: 'percentage', value: 15, description: 'Get 15% off (new customers)' }
};

// Application state
let currentUser = null;
let cart = [];
let wishlist = [];
let orders = [];
let searchQuery = '';
let currentFilter = '';
let currentSort = 'name';

// ========================================
// CURRENCY FORMATTING
// ========================================

/**
 * Format price in Philippine Peso
 * @param {number} price - Price in USD
 * @returns {string} Formatted price in PHP
 */
function formatCurrency(price) {
    const phpPrice = price * EXCHANGE_RATE;
    return new Intl.NumberFormat(CURRENCY_FORMAT, {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(phpPrice);
}

/**
 * Calculate discount amount
 * @param {number} subtotal - Cart subtotal in USD
 * @param {string} promoCode - Promo code
 * @returns {number} Discount amount in USD
 */
function calculateDiscount(subtotal, promoCode) {
    const code = PROMO_CODES[promoCode?.toUpperCase()];
    if (!code) return 0;
    
    if (code.type === 'percentage') {
        return subtotal * (code.value / 100);
    } else if (code.type === 'fixed') {
        return Math.min(code.value / EXCHANGE_RATE, subtotal);
    }
    return 0;
}

// ========================================
// PRODUCT MANAGEMENT
// ========================================

/**
 * Get all products
 * @returns {Array} Array of products
 */
function getProducts() {
    return PRODUCTS;
}

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Object|null} Product object or null
 */
function getProductById(id) {
    return PRODUCTS.find(product => product.id === parseInt(id));
}

/**
 * Get products by category
 * @param {string} category - Product category
 * @returns {Array} Filtered products
 */
function getProductsByCategory(category) {
    if (!category || category === 'All') return PRODUCTS;
    return PRODUCTS.filter(product => product.category === category);
}

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Array} Filtered products
 */
function searchProducts(query) {
    if (!query) return PRODUCTS;
    
    const lowercaseQuery = query.toLowerCase();
    return PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
    );
}

/**
 * Sort products
 * @param {Array} products - Products to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted products
 */
function sortProducts(products, sortBy = 'name') {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'rating':
            return sortedProducts.sort((a, b) => b.rating - a.rating);
        case 'name':
        default:
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
}

/**
 * Get unique categories
 * @returns {Array} Array of categories
 */
function getCategories() {
    const categories = [...new Set(PRODUCTS.map(product => product.category))];
    return ['All', ...categories];
}

// ========================================
// CART MANAGEMENT
// ========================================

/**
 * Add item to cart
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${product.name} added to cart`, 'success');
    
    // Simulate real-time update
    simulateRealTimeUpdate('cart', 'added', productId);
}

/**
 * Remove item from cart
 * @param {number} productId - Product ID
 */
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart();
        updateCartCount();
        showNotification(`${item.name} removed from cart`, 'info');
        
        // Simulate real-time update
        simulateRealTimeUpdate('cart', 'removed', productId);
    }
}

/**
 * Update cart item quantity
 * @param {number} productId - Product ID
 * @param {number} quantity - New quantity
 */
function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartCount();
            
            // Simulate real-time update
            simulateRealTimeUpdate('cart', 'updated', productId);
        }
    }
}

/**
 * Get cart total
 * @returns {number} Cart subtotal in USD
 */
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Get cart item count
 * @returns {number} Total number of items in cart
 */
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Clear cart
 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

// ========================================
// WISHLIST MANAGEMENT
// ========================================

/**
 * Add item to wishlist
 * @param {number} productId - Product ID
 */
function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    if (wishlist.includes(productId)) {
        showNotification(`${product.name} is already in wishlist`, 'warning');
        return;
    }
    
    wishlist.push(productId);
    saveWishlist();
    updateWishlistCount();
    showNotification(`${product.name} added to wishlist`, 'success');
    
    // Simulate real-time update
    simulateRealTimeUpdate('wishlist', 'added', productId);
}

/**
 * Remove item from wishlist
 * @param {number} productId - Product ID
 */
function removeFromWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        const product = getProductById(productId);
        wishlist.splice(index, 1);
        saveWishlist();
        updateWishlistCount();
        showNotification(`${product?.name || 'Item'} removed from wishlist`, 'info');
        
        // Simulate real-time update
        simulateRealTimeUpdate('wishlist', 'removed', productId);
    }
}

/**
 * Check if item is in wishlist
 * @param {number} productId - Product ID
 * @returns {boolean} True if item is in wishlist
 */
function isInWishlist(productId) {
    return wishlist.includes(productId);
}

/**
 * Toggle wishlist item
 * @param {number} productId - Product ID
 */
function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId);
    }
}

/**
 * Get wishlist count
 * @returns {number} Number of items in wishlist
 */
function getWishlistCount() {
    return wishlist.length;
}

// ========================================
// ORDER MANAGEMENT
// ========================================

/**
 * Place order
 * @param {Object} orderData - Order information
 * @returns {string} Order ID
 */
function placeOrder(orderData) {
    const orderId = 'DX' + Date.now();
    const subtotal = getCartTotal();
    const discount = calculateDiscount(subtotal, orderData.promoCode);
    const total = subtotal - discount;
    
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        discount: discount,
        total: total,
        shipping: orderData.shipping,
        payment: orderData.payment,
        status: 'confirmed',
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    orders.push(order);
    saveOrders();
    
    // Clear cart
    clearCart();
    
    showNotification(`Order ${orderId} placed successfully!`, 'success');
    
    // Simulate real-time update
    simulateRealTimeUpdate('order', 'created', orderId);
    
    return orderId;
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Object|null} Order object or null
 */
function getOrderById(orderId) {
    return orders.find(order => order.id === orderId);
}

/**
 * Get user orders
 * @returns {Array} User's orders
 */
function getUserOrders() {
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ========================================
// USER AUTHENTICATION
// ========================================

/**
 * Demo users
 */
const DEMO_USERS = {
    'customer@designxpress.com': {
        password: 'customer123',
        role: 'customer',
        name: 'John Customer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    'vendor@designxpress.com': {
        password: 'vendor123',
        role: 'vendor',
        name: 'Sarah Vendor',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    'admin@designxpress.com': {
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object|null} User object or null
 */
function loginUser(email, password) {
    const user = DEMO_USERS[email];
    
    if (user && user.password === password) {
        currentUser = {
            email: email,
            role: user.role,
            name: user.name,
            avatar: user.avatar,
            loginTime: new Date().toISOString()
        };
        
        saveCurrentUser();
        updateUserInterface();
        showNotification(`Welcome back, ${user.name}!`, 'success');
        
        // Simulate real-time update
        simulateRealTimeUpdate('user', 'login', email);
        
        return currentUser;
    }
    
    showNotification('Invalid email or password', 'error');
    return null;
}

/**
 * Logout user
 */
function logoutUser() {
    if (currentUser) {
        showNotification(`Goodbye, ${currentUser.name}!`, 'info');
        simulateRealTimeUpdate('user', 'logout', currentUser.email);
    }
    
    currentUser = null;
    saveCurrentUser();
    updateUserInterface();
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Check if user has role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has role
 */
function hasRole(role) {
    return currentUser?.role === role;
}

/**
 * Check if user has permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
function hasPermission(permission) {
    if (!currentUser) return false;
    
    const permissions = {
        'manage_products': ['vendor', 'admin'],
        'manage_users': ['admin'],
        'view_analytics': ['vendor', 'admin'],
        'manage_orders': ['vendor', 'admin']
    };
    
    return permissions[permission]?.includes(currentUser.role) || false;
}

// ========================================
// LOCAL STORAGE MANAGEMENT
// ========================================

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('dx_cart', JSON.stringify(cart));
}

/**
 * Load cart from localStorage
 */
function loadCart() {
    const savedCart = localStorage.getItem('dx_cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartCount();
}

/**
 * Save wishlist to localStorage
 */
function saveWishlist() {
    localStorage.setItem('dx_wishlist', JSON.stringify(wishlist));
}

/**
 * Load wishlist from localStorage
 */
function loadWishlist() {
    const savedWishlist = localStorage.getItem('dx_wishlist');
    wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    updateWishlistCount();
}

/**
 * Save orders to localStorage
 */
function saveOrders() {
    localStorage.setItem('dx_orders', JSON.stringify(orders));
}

/**
 * Load orders from localStorage
 */
function loadOrders() {
    const savedOrders = localStorage.getItem('dx_orders');
    orders = savedOrders ? JSON.parse(savedOrders) : [];
}

/**
 * Save current user to localStorage
 */
function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('dx_current_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('dx_current_user');
    }
}

/**
 * Load current user from localStorage
 */
function loadCurrentUser() {
    const savedUser = localStorage.getItem('dx_current_user');
    currentUser = savedUser ? JSON.parse(savedUser) : null;
}

/**
 * Clear all application data
 */
function clearAllData() {
    localStorage.clear();
    cart = [];
    wishlist = [];
    orders = [];
    currentUser = null;
    updateCartCount();
    updateWishlistCount();
    updateUserInterface();
}

// ========================================
// UI UPDATES
// ========================================

/**
 * Update cart count in UI
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'inline' : 'none';
    });
}

/**
 * Update wishlist count in UI
 */
function updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    const count = getWishlistCount();
    
    wishlistCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'inline' : 'none';
    });
}

/**
 * Update user interface based on login state
 */
function updateUserInterface() {
    const userElements = document.querySelectorAll('.user-info');
    const authElements = document.querySelectorAll('.auth-required');
    const guestElements = document.querySelectorAll('.guest-only');
    
    if (isLoggedIn()) {
        userElements.forEach(element => {
            const userName = element.querySelector('.user-name');
            const userAvatar = element.querySelector('.user-avatar');
            
            if (userName) userName.textContent = currentUser.name;
            if (userAvatar) userAvatar.src = currentUser.avatar;
            
            element.style.display = 'flex';
        });
        
        authElements.forEach(element => element.style.display = 'block');
        guestElements.forEach(element => element.style.display = 'none');
    } else {
        userElements.forEach(element => element.style.display = 'none');
        authElements.forEach(element => element.style.display = 'none');
        guestElements.forEach(element => element.style.display = 'block');
    }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Create notification container if it doesn't exist
 * @returns {HTMLElement} Notification container
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// ========================================
// REAL-TIME SIMULATION
// ========================================

/**
 * Simulate real-time database update
 * @param {string} type - Update type (cart, wishlist, order, user)
 * @param {string} action - Action performed
 * @param {*} data - Related data
 */
function simulateRealTimeUpdate(type, action, data) {
    // Simulate network delay
    setTimeout(() => {
        const update = {
            type: type,
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            user: currentUser?.email || 'guest'
        };
        
        // Store real-time updates for demo
        const updates = JSON.parse(localStorage.getItem('dx_realtime_updates') || '[]');
        updates.push(update);
        
        // Keep only last 50 updates
        if (updates.length > 50) {
            updates.splice(0, updates.length - 50);
        }
        
        localStorage.setItem('dx_realtime_updates', JSON.stringify(updates));
        
        // Trigger real-time UI updates
        if (typeof handleRealTimeUpdate === 'function') {
            handleRealTimeUpdate(update);
        }
    }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
}

/**
 * Handle real-time updates
 * @param {Object} update - Update object
 */
function handleRealTimeUpdate(update) {
    switch (update.type) {
        case 'cart':
            updateCartCount();
            break;
        case 'wishlist':
            updateWishlistCount();
            break;
        case 'order':
            if (update.action === 'created') {
                loadOrders();
            }
            break;
        case 'user':
            if (update.action === 'login') {
                updateUserInterface();
            }
            break;
    }
}

// ========================================
// SEARCH & FILTER
// ========================================

/**
 * Filter and sort products
 * @param {string} query - Search query
 * @param {string} category - Category filter
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Filtered and sorted products
 */
function filterAndSortProducts(query = '', category = '', sortBy = 'name') {
    let products = getProducts();
    
    // Apply search
    if (query) {
        products = searchProducts(query);
    }
    
    // Apply category filter
    if (category && category !== 'All') {
        products = products.filter(product => product.category === category);
    }
    
    // Apply sorting
    products = sortProducts(products, sortBy);
    
    return products;
}

// ========================================
// ANALYTICS & TRACKING
// ========================================

/**
 * Track user event
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function trackEvent(event, data = {}) {
    const trackingData = {
        event: event,
        data: data,
        timestamp: new Date().toISOString(),
        user: currentUser?.email || 'guest',
        session: getSessionId()
    };
    
    // Store analytics data
    const analytics = JSON.parse(localStorage.getItem('dx_analytics') || '[]');
    analytics.push(trackingData);
    
    // Keep only last 1000 events
    if (analytics.length > 1000) {
        analytics.splice(0, analytics.length - 1000);
    }
    
    localStorage.setItem('dx_analytics', JSON.stringify(analytics));
    
    // Simulate real-time analytics update
    simulateRealTimeUpdate('analytics', event, trackingData);
}

/**
 * Generate session ID
 * @returns {string} Session ID
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('dx_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('dx_session_id', sessionId);
    }
    return sessionId;
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the application
 */
function initializeApp() {
    // Load data from localStorage
    loadCart();
    loadWishlist();
    loadOrders();
    loadCurrentUser();
    
    // Update UI
    updateCartCount();
    updateWishlistCount();
    updateUserInterface();
    
    // Track app initialization
    trackEvent('app_initialized', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    });
    
    console.log('D\'Xpress E-Commerce Platform initialized successfully!');
    console.log('💱 Currency: Philippine Peso (₱)');
    console.log('⚡ Real-time features enabled');
    console.log('📱 TikTok-style dashboard ready');
    console.log('🛒 Shopping cart:', cart.length, 'items');
    console.log('❤️  Wishlist:', wishlist.length, 'items');
    console.log('👤 User:', currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest');
}

// ========================================
// DOM CONTENT LOADED
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Track page view
    trackEvent('page_view', {
        url: window.location.href,
        title: document.title
    });
});

// ========================================
// GLOBAL EXPORTS (for debugging)
// ========================================

window.DXpress = {
    // Core data
    products: PRODUCTS,
    cart: () => cart,
    wishlist: () => wishlist,
    orders: () => orders,
    currentUser: () => currentUser,
    
    // Core functions
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    loginUser,
    logoutUser,
    placeOrder,
    formatCurrency,
    showNotification,
    trackEvent,
    
    // Utils
    getProducts,
    getProductById,
    searchProducts,
    filterAndSortProducts,
    hasRole,
    hasPermission,
    calculateDiscount,
    getCartTotal,
    getCartCount,
    getWishlistCount,
    
    // Data management
    saveCart,
    saveWishlist,
    saveOrders,
    clearAllData
};

console.log('🚀 D\'Xpress loaded successfully! Use DXpress.* to access functions.');