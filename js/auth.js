/**
 * D'Xpress Authentication System
 * Author: MiniMax Agent
 * 
 * Handles user authentication, session management, and role-based access control
 * Includes real-time session tracking and security features
 */

// ========================================
// AUTHENTICATION CONFIGURATION
// ========================================

const AUTH_CONFIG = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    passwordMinLength: 6,
    sessionCheckInterval: 60000, // Check every minute
    securityEvents: []
};

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * Check if current session is valid
 * @returns {boolean} True if session is valid
 */
function isValidSession() {
    if (!currentUser) return false;
    
    const sessionData = getSessionData();
    if (!sessionData) return false;
    
    // Check if session has expired
    const now = new Date().getTime();
    const sessionAge = now - sessionData.loginTime;
    
    if (sessionAge > AUTH_CONFIG.sessionTimeout) {
        logoutUser('Session expired');
        return false;
    }
    
    // Update last activity
    sessionData.lastActivity = now;
    setSessionData(sessionData);
    
    return true;
}

/**
 * Get session data
 * @returns {Object|null} Session data or null
 */
function getSessionData() {
    const sessionKey = `dx_session_${currentUser?.email}`;
    const sessionData = localStorage.getItem(sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * Set session data
 * @param {Object} data - Session data
 */
function setSessionData(data) {
    const sessionKey = `dx_session_${data.email}`;
    localStorage.setItem(sessionKey, JSON.stringify(data));
}

/**
 * Create new session
 * @param {Object} user - User object
 */
function createSession(user) {
    const sessionData = {
        email: user.email,
        loginTime: new Date().getTime(),
        lastActivity: new Date().getTime(),
        sessionId: generateSessionId(),
        userAgent: navigator.userAgent,
        ip: getClientIP(), // Simulated for demo
        loginSource: detectLoginSource()
    };
    
    setSessionData(sessionData);
    
    // Track security event
    trackSecurityEvent('user_login', {
        email: user.email,
        role: user.role,
        sessionId: sessionData.sessionId,
        userAgent: sessionData.userAgent
    });
}

/**
 * Clear all sessions for user
 * @param {string} email - User email
 */
function clearUserSessions(email) {
    const prefix = `dx_session_${email}`;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    });
}

// ========================================
// ACCESS CONTROL
// ========================================

/**
 * Check if current page requires authentication
 * @param {string} page - Page name
 * @returns {boolean} True if authentication required
 */
function requiresAuth(page) {
    const authRequired = [
        'dashboard.html',
        'admin.html',
        'orders.html',
        'profile.html',
        'product-management.html'
    ];
    
    return authRequired.includes(page);
}

/**
 * Check if current page requires admin role
 * @param {string} page - Page name
 * @returns {boolean} True if admin role required
 */
function requiresAdmin(page) {
    const adminRequired = [
        'admin.html',
        'product-management.html'
    ];
    
    return adminRequired.includes(page);
}

/**
 * Check if current page requires vendor role or higher
 * @param {string} page - Page name
 * @returns {boolean} True if vendor role required
 */
function requiresVendor(page) {
    const vendorRequired = [
        'product-management.html'
    ];
    
    return vendorRequired.includes(page);
}

/**
 * Redirect user based on authentication and role
 * @param {string} targetPage - Target page URL
 */
function redirectUser(targetPage) {
    if (!isLoggedIn()) {
        // Store current page for redirect after login
        sessionStorage.setItem('dx_current_page', targetPage);
        window.location.href = 'login.html';
        return;
    }
    
    const page = targetPage.split('/').pop() || 'index.html';
    
    // Check role requirements
    if (requiresAdmin(page) && !hasRole('admin')) {
        showAccessDenied('Admin access required');
        return;
    }
    
    if (requiresVendor(page) && !hasRole('vendor') && !hasRole('admin')) {
        showAccessDenied('Vendor or admin access required');
        return;
    }
    
    // Valid access
    window.location.href = targetPage;
}

/**
 * Show access denied message and redirect
 * @param {string} message - Access denied message
 */
function showAccessDenied(message) {
    showNotification(message, 'error');
    
    setTimeout(() => {
        if (hasRole('admin')) {
            window.location.href = 'admin.html';
        } else if (hasRole('vendor')) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 2000);
    
    trackSecurityEvent('access_denied', {
        message: message,
        user: currentUser?.email,
        page: window.location.pathname
    });
}

// ========================================
// SECURITY FEATURES
// ========================================

/**
 * Track security events
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function trackSecurityEvent(event, data) {
    const securityEvent = {
        event: event,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    AUTH_CONFIG.securityEvents.push(securityEvent);
    
    // Keep only last 100 events
    if (AUTH_CONFIG.securityEvents.length > 100) {
        AUTH_CONFIG.securityEvents = AUTH_CONFIG.securityEvents.slice(-100);
    }
    
    // Store in localStorage
    localStorage.setItem('dx_security_events', JSON.stringify(AUTH_CONFIG.securityEvents));
    
    // Log critical events
    if (['suspicious_activity', 'multiple_failed_logins', 'unauthorized_access'].includes(event)) {
        console.warn('Security Event:', event, data);
    }
}

/**
 * Check for suspicious activity
 * @returns {boolean} True if suspicious activity detected
 */
function checkSuspiciousActivity() {
    const events = AUTH_CONFIG.securityEvents.slice(-10);
    const failedLogins = events.filter(e => e.event === 'login_failed').length;
    
    if (failedLogins >= AUTH_CONFIG.maxLoginAttempts) {
        trackSecurityEvent('suspicious_activity', {
            reason: 'multiple_failed_logins',
            failedAttempts: failedLogins,
            timeWindow: 'last_10_events'
        });
        return true;
    }
    
    // Check for rapid page changes
    const pageChanges = events.filter(e => e.event === 'page_access').length;
    if (pageChanges > 20) {
        trackSecurityEvent('suspicious_activity', {
            reason: 'rapid_page_access',
            pageChanges: pageChanges,
            timeWindow: 'last_10_events'
        });
        return true;
    }
    
    return false;
}

/**
 * Generate secure session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    const userAgent = navigator.userAgent.length.toString(36);
    return `${timestamp}_${randomStr}_${userAgent}`.toUpperCase();
}

/**
 * Get client IP (simulated for demo)
 * @returns {string} Client IP
 */
function getClientIP() {
    // In a real application, this would be obtained from the server
    return '192.168.1.' + Math.floor(Math.random() * 255);
}

/**
 * Detect login source
 * @returns {string} Login source
 */
function detectLoginSource() {
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Mobile')) return 'mobile_app';
    if (referrer.includes('google.com')) return 'google_oauth';
    if (referrer.includes('facebook.com')) return 'facebook_oauth';
    return 'web_browser';
}

// ========================================
// PASSWORD MANAGEMENT
// ========================================

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
    const result = {
        isValid: false,
        errors: [],
        strength: 'weak',
        score: 0
    };
    
    // Check minimum length
    if (password.length < AUTH_CONFIG.passwordMinLength) {
        result.errors.push(`Password must be at least ${AUTH_CONFIG.passwordMinLength} characters long`);
        return result;
    }
    
    let score = 0;
    
    // Check for lowercase
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        result.errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        result.errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check for numbers
    if (/[0-9]/.test(password)) {
        score += 1;
    } else {
        result.errors.push('Password must contain at least one number');
    }
    
    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1;
    } else {
        result.errors.push('Password must contain at least one special character');
    }
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
        result.errors.push('Password cannot contain repeated characters');
        return result;
    }
    
    if (/(123|abc|password|qwerty)/i.test(password)) {
        result.errors.push('Password cannot contain common patterns');
        return result;
    }
    
    result.score = score;
    
    // Determine strength
    if (score >= 4) {
        result.strength = 'strong';
    } else if (score >= 3) {
        result.strength = 'medium';
    } else {
        result.strength = 'weak';
    }
    
    result.isValid = result.errors.length === 0;
    return result;
}

/**
 * Hash password (simulated)
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
 */
function hashPassword(password) {
    // In a real application, use a proper hashing algorithm like bcrypt
    return btoa(password + 'dx_salt_2025');
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {boolean} True if password changed successfully
 */
function changePassword(currentPassword, newPassword) {
    if (!isLoggedIn()) {
        showNotification('Please login to change password', 'error');
        return false;
    }
    
    // Verify current password
    const user = DEMO_USERS[currentUser.email];
    if (!user || user.password !== currentPassword) {
        showNotification('Current password is incorrect', 'error');
        return false;
    }
    
    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        showNotification(`Password validation failed: ${validation.errors.join(', ')}`, 'error');
        return false;
    }
    
    // Update password (simulated)
    user.password = newPassword;
    DEMO_USERS[currentUser.email] = user;
    
    showNotification('Password changed successfully', 'success');
    
    trackSecurityEvent('password_changed', {
        email: currentUser.email,
        strength: validation.strength
    });
    
    return true;
}

// ========================================
// ACCOUNT LOCKOUT
// ========================================

/**
 * Check if account is locked
 * @param {string} email - User email
 * @returns {boolean} True if account is locked
 */
function isAccountLocked(email) {
    const lockKey = `dx_account_lock_${email}`;
    const lockData = localStorage.getItem(lockKey);
    
    if (!lockData) return false;
    
    const lock = JSON.parse(lockData);
    const now = new Date().getTime();
    
    // Check if lockout has expired
    if (now > lock.lockoutUntil) {
        localStorage.removeItem(lockKey);
        return false;
    }
    
    return true;
}

/**
 * Lock account
 * @param {string} email - User email
 * @param {number} duration - Lockout duration in ms
 */
function lockAccount(email, duration = AUTH_CONFIG.lockoutDuration) {
    const lockKey = `dx_account_lock_${email}`;
    const lockData = {
        email: email,
        lockoutUntil: new Date().getTime() + duration,
        reason: 'multiple_failed_attempts',
        attempts: getFailedLoginAttempts(email)
    };
    
    localStorage.setItem(lockKey, JSON.stringify(lockData));
    
    trackSecurityEvent('account_locked', {
        email: email,
        duration: duration,
        attempts: lockData.attempts
    });
}

/**
 * Get failed login attempts for user
 * @param {string} email - User email
 * @returns {number} Number of failed attempts
 */
function getFailedLoginAttempts(email) {
    const attemptsKey = `dx_failed_attempts_${email}`;
    const attempts = localStorage.getItem(attemptsKey);
    return attempts ? parseInt(attempts) : 0;
}

/**
 * Record failed login attempt
 * @param {string} email - User email
 */
function recordFailedLoginAttempt(email) {
    const attemptsKey = `dx_failed_attempts_${email}`;
    let attempts = getFailedLoginAttempts(email);
    attempts += 1;
    
    localStorage.setItem(attemptsKey, attempts.toString());
    
    // Check if should lock account
    if (attempts >= AUTH_CONFIG.maxLoginAttempts) {
        lockAccount(email);
        showNotification('Account temporarily locked due to multiple failed attempts', 'error');
    }
    
    trackSecurityEvent('login_failed', {
        email: email,
        attempts: attempts,
        reason: 'invalid_credentials'
    });
}

/**
 * Reset failed login attempts
 * @param {string} email - User email
 */
function resetFailedLoginAttempts(email) {
    const attemptsKey = `dx_failed_attempts_${email}`;
    localStorage.removeItem(attemptsKey);
}

/**
 * Get account lockout status
 * @param {string} email - User email
 * @returns {Object|null} Lockout info or null
 */
function getAccountLockoutStatus(email) {
    const lockKey = `dx_account_lock_${email}`;
    const lockData = localStorage.getItem(lockKey);
    
    if (!lockData) return null;
    
    const lock = JSON.parse(lockData);
    const now = new Date().getTime();
    const remainingTime = Math.max(0, lock.lockoutUntil - now);
    
    return {
        ...lock,
        remainingTime: remainingTime,
        isLocked: remainingTime > 0
    };
}

// ========================================
// INITIALIZATION & MONITORING
// ========================================

/**
 * Initialize authentication system
 */
function initializeAuth() {
    // Load current user if exists
    loadCurrentUser();
    
    // Check for existing session
    if (currentUser && !isValidSession()) {
        logoutUser('Session expired');
        return;
    }
    
    // Setup session monitoring
    setupSessionMonitoring();
    
    // Track page access
    trackSecurityEvent('page_access', {
        page: window.location.pathname,
        user: currentUser?.email
    });
    
    // Check for suspicious activity
    if (checkSuspiciousActivity()) {
        console.warn('Suspicious activity detected');
    }
}

/**
 * Setup session monitoring
 */
function setupSessionMonitoring() {
    // Check session validity periodically
    setInterval(() => {
        if (currentUser && !isValidSession()) {
            logoutUser('Session monitoring detected timeout');
        }
    }, AUTH_CONFIG.sessionCheckInterval);
    
    // Track user activity
    ['click', 'keypress', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            if (currentUser) {
                const sessionData = getSessionData();
                if (sessionData) {
                    sessionData.lastActivity = new Date().getTime();
                    setSessionData(sessionData);
                }
            }
        }, { passive: true });
    });
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && currentUser) {
            // Page is hidden, could be a security concern
            trackSecurityEvent('page_hidden', {
                user: currentUser.email,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            trackSecurityEvent('page_unload', {
                user: currentUser.email,
                sessionDuration: Date.now() - (getSessionData()?.loginTime || Date.now())
            });
        }
    });
}

/**
 * Enhanced logout with security tracking
 * @param {string} reason - Logout reason
 */
function logoutUser(reason = 'user_initiated') {
    if (currentUser) {
        // Track logout
        trackSecurityEvent('user_logout', {
            email: currentUser.email,
            reason: reason,
            sessionDuration: getSessionData() ? Date.now() - getSessionData().loginTime : 0
        });
        
        // Clear user sessions
        clearUserSessions(currentUser.email);
        
        // Clear current user
        currentUser = null;
        saveCurrentUser();
        
        // Update UI
        updateUserInterface();
    }
    
    // Redirect if on protected page
    const currentPage = window.location.pathname.split('/').pop();
    if (requiresAuth(currentPage) || requiresAdmin(currentPage) || requiresVendor(currentPage)) {
        window.location.href = 'index.html';
    }
}

// ========================================
// ENHANCED USER INTERFACE UPDATES
// ========================================

/**
 * Enhanced user interface update with security indicators
 */
function updateUserInterface() {
    const userElements = document.querySelectorAll('.user-info');
    const authElements = document.querySelectorAll('.auth-required');
    const guestElements = document.querySelectorAll('.guest-only');
    const adminElements = document.querySelectorAll('.admin-only');
    const vendorElements = document.querySelectorAll('.vendor-only');
    
    if (isLoggedIn() && isValidSession()) {
        // Update user info
        userElements.forEach(element => {
            const userName = element.querySelector('.user-name');
            const userAvatar = element.querySelector('.user-avatar');
            
            if (userName) userName.textContent = currentUser.name;
            if (userAvatar) userAvatar.src = currentUser.avatar;
            
            element.style.display = 'flex';
        });
        
        // Show authenticated elements
        authElements.forEach(element => element.style.display = 'block');
        guestElements.forEach(element => element.style.display = 'none');
        
        // Show role-specific elements
        adminElements.forEach(element => {
            element.style.display = hasRole('admin') ? 'block' : 'none';
        });
        
        vendorElements.forEach(element => {
            element.style.display = hasRole('vendor') || hasRole('admin') ? 'block' : 'none';
        });
        
        // Update session indicator if present
        const sessionIndicator = document.querySelector('.session-indicator');
        if (sessionIndicator) {
            const sessionData = getSessionData();
            const remainingTime = AUTH_CONFIG.sessionTimeout - (Date.now() - sessionData?.loginTime);
            
            if (remainingTime < 5 * 60 * 1000) { // Less than 5 minutes
                sessionIndicator.style.color = 'var(--warning-500)';
                sessionIndicator.textContent = 'Session expiring soon';
            } else {
                sessionIndicator.style.color = 'var(--success-500)';
                sessionIndicator.textContent = 'Session active';
            }
        }
        
    } else {
        // Show guest elements
        userElements.forEach(element => element.style.display = 'none');
        authElements.forEach(element => element.style.display = 'none');
        guestElements.forEach(element => element.style.display = 'block');
        adminElements.forEach(element => element.style.display = 'none');
        vendorElements.forEach(element => element.style.display = 'none');
    }
}

/**
 * Show security alert
 * @param {string} message - Alert message
 * @param {string} type - Alert type
 */
function showSecurityAlert(message, type = 'warning') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `security-alert security-alert-${type}`;
    alertContainer.innerHTML = `
        <div class="security-alert-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (alertContainer.parentElement) {
            alertContainer.remove();
        }
    }, 10000);
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// Global authentication object for external access
window.Auth = {
    // User management
    login: loginUser,
    logout: logoutUser,
    hasRole: hasRole,
    hasPermission: hasPermission,
    changePassword: changePassword,
    
    // Session management
    isValidSession: isValidSession,
    getSessionData: getSessionData,
    
    // Security
    trackEvent: trackSecurityEvent,
    checkSuspiciousActivity: checkSuspiciousActivity,
    validatePassword: validatePassword,
    
    // Account management
    isAccountLocked: isAccountLocked,
    getAccountLockoutStatus: getAccountLockoutStatus,
    
    // UI
    updateUserInterface: updateUserInterface,
    showSecurityAlert: showSecurityAlert,
    
    // Configuration
    config: AUTH_CONFIG
};

console.log('🔐 D\'Xpress Authentication System loaded successfully!');
console.log('🛡️  Security features enabled');
console.log('⏰ Session monitoring active');
console.log('🎭 Role-based access control ready');