/**
 * TikTok-Style Social Commerce Dashboard JavaScript
 * Author: MiniMax Agent
 * 
 * Handles social interactions, feed management, and real-time features
 * for the TikTok-style e-commerce dashboard
 */

// ========================================
// TIKTOK DASHBOARD CONFIGURATION
// ========================================

const TIKTOK_CONFIG = {
    // Feed settings
    slidesPerLoad: 4,
    scrollThreshold: 0.8,
    autoSlideInterval: 10000, // 10 seconds
    gestureMinDistance: 50,
    gestureMaxTime: 500,
    
    // Social features
    maxLikesPerUser: 100,
    maxSharesPerUser: 50,
    commentCharacterLimit: 500,
    
    // Performance
    imageLazyLoadDistance: 200,
    videoPreloadDistance: 500,
    
    // Animation settings
    slideTransitionDuration: 300,
    likeAnimationDuration: 600,
    followAnimationDuration: 600,
    
    // Data persistence
    socialDataKeys: {
        likes: 'dx_user_likes',
        follows: 'dx_user_follows',
        shares: 'dx_user_shares',
        comments: 'dx_user_comments',
        views: 'dx_user_views'
    }
};

// ========================================
// FEED MANAGEMENT
// ========================================

/**
 * Feed data storage
 */
const FeedManager = {
    currentFeed: [],
    currentFeedType: 'forYou',
    currentIndex: 0,
    isLoading: false,
    hasMore: true,
    
    /**
     * Load feed products
     */
    async loadFeed(feedType = 'forYou', offset = 0, limit = TIKTOK_CONFIG.slidesPerLoad) {
        if (this.isLoading) return [];
        
        this.isLoading = true;
        this.currentFeedType = feedType;
        
        try {
            let products = [];
            
            switch (feedType) {
                case 'forYou':
                    products = this.getForYouFeed(offset, limit);
                    break;
                case 'following':
                    products = this.getFollowingFeed(offset, limit);
                    break;
                case 'trending':
                    products = this.getTrendingFeed(offset, limit);
                    break;
                case 'deals':
                    products = this.getDealsFeed(offset, limit);
                    break;
                default:
                    products = this.getForYouFeed(offset, limit);
            }
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            
            return products;
            
        } catch (error) {
            console.error('Error loading feed:', error);
            return [];
        } finally {
            this.isLoading = false;
        }
    },
    
    /**
     * Get "For You" personalized feed
     */
    getForYouFeed(offset, limit) {
        const allProducts = getProducts();
        const userLikes = JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.likes) || '[]');
        const userViews = JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.views) || '{}');
        
        // Score products based on user preferences
        const scoredProducts = allProducts.map(product => {
            let score = 0;
            
            // Boost liked categories
            if (userLikes.includes(product.id)) {
                score += 10;
            }
            
            // Boost viewed products
            const views = userViews[product.id] || 0;
            score += Math.min(views * 2, 5);
            
            // Boost high-rated products
            score += product.rating * 2;
            
            // Add randomness for discovery
            score += Math.random() * 3;
            
            return { ...product, score };
        });
        
        // Sort by score and return slice
        return scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(offset, offset + limit);
    },
    
    /**
     * Get following feed (simulated)
     */
    getFollowingFeed(offset, limit) {
        const follows = JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.follows) || '[]');
        
        // If no follows, return trending products
        if (follows.length === 0) {
            return this.getTrendingFeed(offset, limit);
        }
        
        // Simulate followed vendors' products
        const products = getProducts()
            .filter(p => follows.includes(p.id % 4 + 1)) // Simulate vendor follows
            .sort(() => Math.random() - 0.5); // Random order for followed content
        
        return products.slice(offset, offset + limit);
    },
    
    /**
     * Get trending feed
     */
    getTrendingFeed(offset, limit) {
        return getProducts()
            .map(product => ({
                ...product,
                trendScore: product.rating * product.reviews + Math.random() * 100
            }))
            .sort((a, b) => b.trendScore - a.trendScore)
            .slice(offset, offset + limit);
    },
    
    /**
     * Get deals feed
     */
    getDealsFeed(offset, limit) {
        return getProducts()
            .filter(p => p.price < 400) // Products under ₱400
            .sort((a, b) => a.price - b.price)
            .slice(offset, offset + limit);
    },
    
    /**
     * Add products to current feed
     */
    addProducts(products) {
        this.currentFeed.push(...products);
        this.hasMore = products.length === TIKTOK_CONFIG.slidesPerLoad;
    },
    
    /**
     * Reset feed
     */
    resetFeed() {
        this.currentFeed = [];
        this.currentIndex = 0;
        this.hasMore = true;
    },
    
    /**
     * Get current product
     */
    getCurrentProduct() {
        return this.currentFeed[this.currentIndex];
    },
    
    /**
     * Go to next product
     */
    nextProduct() {
        if (this.currentIndex < this.currentFeed.length - 1) {
            this.currentIndex++;
            return true;
        }
        return false;
    },
    
    /**
     * Go to previous product
     */
    prevProduct() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return true;
        }
        return false;
    }
};

// ========================================
// SOCIAL INTERACTIONS
// ========================================

/**
 * Social interactions manager
 */
const SocialInteractions = {
    data: {
        likes: JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.likes) || '[]'),
        follows: JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.follows) || '[]'),
        shares: JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.shares) || '[]'),
        comments: JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.comments) || '[]'),
        views: JSON.parse(localStorage.getItem(TIKTOK_CONFIG.socialDataKeys.views) || '{}')
    },
    
    // Like product
    likeProduct(productId, button) {
        const isLiked = this.data.likes.includes(productId);
        
        if (isLiked) {
            this.unlikeProduct(productId, button);
            return;
        }
        
        if (this.data.likes.length >= TIKTOK_CONFIG.maxLikesPerUser) {
            showNotification('Like limit reached', 'warning');
            return;
        }
        
        this.data.likes.push(productId);
        this.saveData();
        
        // Update UI
        if (button) {
            button.classList.add('liked');
            this.animateButton(button, 'like');
        }
        
        // Update count
        this.updateSocialCount(button);
        
        // Show feedback
        showNotification('Added to favorites', 'success');
        
        // Track event
        trackEvent('product_liked', {
            productId: productId,
            user: currentUser?.email || 'guest',
            totalLikes: this.data.likes.length
        });
        
        // Simulate real-time update
        simulateRealTimeUpdate('like', 'added', productId);
    },
    
    // Unlike product
    unlikeProduct(productId, button) {
        this.data.likes = this.data.likes.filter(id => id !== productId);
        this.saveData();
        
        // Update UI
        if (button) {
            button.classList.remove('liked');
        }
        
        // Update count
        this.updateSocialCount(button);
        
        // Show feedback
        showNotification('Removed from favorites', 'info');
        
        // Track event
        trackEvent('product_unliked', {
            productId: productId,
            user: currentUser?.email || 'guest'
        });
    },
    
    // Follow vendor
    followVendor(vendorId, button) {
        const isFollowed = this.data.follows.includes(vendorId);
        
        if (isFollowed) {
            this.unfollowVendor(vendorId, button);
            return;
        }
        
        this.data.follows.push(vendorId);
        this.saveData();
        
        // Update UI
        if (button) {
            button.classList.add('followed');
            this.animateButton(button, 'follow');
        }
        
        // Show feedback
        const vendorNames = {
            1: 'TechHub Store',
            2: 'Fashion Forward',
            3: 'Home Essentials',
            4: 'Style Accessories'
        };
        
        showNotification(`Following ${vendorNames[vendorId] || 'Vendor'}`, 'success');
        
        // Track event
        trackEvent('vendor_followed', {
            vendorId: vendorId,
            user: currentUser?.email || 'guest'
        });
        
        // Simulate real-time update
        simulateRealTimeUpdate('follow', 'added', vendorId);
    },
    
    // Unfollow vendor
    unfollowVendor(vendorId, button) {
        this.data.follows = this.data.follows.filter(id => id !== vendorId);
        this.saveData();
        
        // Update UI
        if (button) {
            button.classList.remove('followed');
        }
        
        // Show feedback
        showNotification('Unfollowed vendor', 'info');
        
        // Track event
        trackEvent('vendor_unfollowed', {
            vendorId: vendorId,
            user: currentUser?.email || 'guest'
        });
    },
    
    // Share product
    shareProduct(productId, button) {
        if (this.data.shares.length >= TIKTOK_CONFIG.maxSharesPerUser) {
            showNotification('Share limit reached', 'warning');
            return;
        }
        
        const product = getProductById(productId);
        const shareText = `Check out ${product.name} on D'Xpress for ${formatCurrency(product.price)}!`;
        
        if (navigator.share) {
            navigator.share({
                title: `${product.name} - D'Xpress`,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText + ` ${window.location.href}`);
            showNotification('Product link copied to clipboard!', 'success');
        }
        
        // Update share data
        if (!this.data.shares.includes(productId)) {
            this.data.shares.push(productId);
            this.saveData();
        }
        
        // Track event
        trackEvent('product_shared', {
            productId: productId,
            user: currentUser?.email || 'guest'
        });
        
        // Update UI count
        this.updateSocialCount(button);
    },
    
    // Add comment
    addComment(productId, comment) {
        if (!comment || comment.length === 0) {
            showNotification('Please enter a comment', 'warning');
            return;
        }
        
        if (comment.length > TIKTOK_CONFIG.commentCharacterLimit) {
            showNotification(`Comment must be less than ${TIKTOK_CONFIG.commentCharacterLimit} characters`, 'warning');
            return;
        }
        
        const commentData = {
            id: Date.now(),
            productId: productId,
            user: currentUser?.email || 'guest',
            content: comment,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        
        this.data.comments.push(commentData);
        this.saveData();
        
        showNotification('Comment added!', 'success');
        
        // Track event
        trackEvent('comment_added', {
            productId: productId,
            user: currentUser?.email || 'guest'
        });
        
        // Simulate real-time update
        simulateRealTimeUpdate('comment', 'added', productId);
    },
    
    // Track product view
    trackView(productId) {
        const currentViews = this.data.views[productId] || 0;
        this.data.views[productId] = currentViews + 1;
        this.saveData();
        
        // Track view event (less frequent to avoid spam)
        if (currentViews % 3 === 0) { // Track every 3rd view
            trackEvent('product_viewed', {
                productId: productId,
                user: currentUser?.email || 'guest',
                viewCount: this.data.views[productId]
            });
        }
    },
    
    // Update social count display
    updateSocialCount(button) {
        const countElement = button?.parentElement?.querySelector('.rail-count');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent) || 0;
            const increment = button.classList.contains('liked') ? 1 : -1;
            const newCount = Math.max(0, currentCount + increment);
            countElement.textContent = newCount;
        }
    },
    
    // Animate button interaction
    animateButton(button, type) {
        const duration = type === 'like' ? TIKTOK_CONFIG.likeAnimationDuration : TIKTOK_CONFIG.followAnimationDuration;
        button.style.animation = `${type}Animation ${duration}ms ease-out`;
        
        setTimeout(() => {
            button.style.animation = '';
        }, duration);
    },
    
    // Save all social data
    saveData() {
        Object.keys(TIKTOK_CONFIG.socialDataKeys).forEach(key => {
            localStorage.setItem(TIKTOK_CONFIG.socialDataKeys[key], JSON.stringify(this.data[key]));
        });
    },
    
    // Check if product is liked
    isLiked(productId) {
        return this.data.likes.includes(productId);
    },
    
    // Check if vendor is followed
    isFollowed(vendorId) {
        return this.data.follows.includes(vendorId);
    },
    
    // Check if product is shared
    isShared(productId) {
        return this.data.shares.includes(productId);
    }
};

// ========================================
// GESTURE HANDLING
// ========================================

/**
 * Gesture manager for mobile interactions
 */
const GestureManager = {
    isEnabled: false,
    startY: 0,
    startX: 0,
    startTime: 0,
    thresholds: {
        vertical: TIKTOK_CONFIG.gestureMinDistance,
        horizontal: 30,
        time: TIKTOK_CONFIG.gestureMaxTime
    },
    
    // Initialize gesture handling
    init() {
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        
        console.log('👆 TikTok gestures initialized');
    },
    
    // Setup touch events
    setupTouchEvents() {
        const feed = document.getElementById('tiktokFeed');
        if (!feed) return;
        
        // Use passive event listeners for better performance
        feed.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        feed.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        feed.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Prevent default scroll behavior on vertical swipes
        feed.addEventListener('touchmove', (e) => {
            if (Math.abs(e.touches[0].clientY - this.startY) > Math.abs(e.touches[0].clientX - this.startX)) {
                e.preventDefault();
            }
        }, { passive: false });
    },
    
    // Setup keyboard events for desktop testing
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(FeedManager.currentFeed.length - 1);
                    break;
            }
        });
    },
    
    // Handle touch start
    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
        this.startX = e.touches[0].clientX;
        this.startTime = Date.now();
    },
    
    // Handle touch move
    handleTouchMove(e) {
        // Prevent scrolling during vertical gestures
        const deltaY = Math.abs(e.touches[0].clientY - this.startY);
        const deltaX = Math.abs(e.touches[0].clientX - this.startX);
        
        if (deltaY > deltaX && deltaY > 10) {
            e.preventDefault();
        }
    },
    
    // Handle touch end
    handleTouchEnd(e) {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const deltaY = this.startY - endY;
        const deltaX = this.startX - endX;
        const deltaTime = Date.now() - this.startTime;
        
        // Only process quick gestures
        if (deltaTime > this.thresholds.time) return;
        
        // Vertical swipe detection
        if (Math.abs(deltaY) > this.thresholds.vertical && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (deltaY > 0) {
                // Swipe up - next slide
                this.nextSlide();
            } else {
                // Swipe down - previous slide
                this.prevSlide();
            }
        }
        
        // Horizontal swipe detection (for future features)
        else if (Math.abs(deltaX) > this.thresholds.horizontal) {
            if (deltaX > 0) {
                // Swipe left - next product in carousel
                this.nextImage();
            } else {
                // Swipe right - previous product in carousel
                this.prevImage();
            }
        }
    },
    
    // Navigation methods
    nextSlide() {
        if (FeedManager.nextProduct()) {
            this.goToCurrentSlide();
            this.trackSlideView();
        } else {
            // Load more content if available
            this.loadMoreContent();
        }
    },
    
    prevSlide() {
        if (FeedManager.prevProduct()) {
            this.goToCurrentSlide();
        }
    },
    
    goToSlide(index) {
        if (index >= 0 && index < FeedManager.currentFeed.length) {
            FeedManager.currentIndex = index;
            this.goToCurrentSlide();
            this.trackSlideView();
        }
    },
    
    // Update current slide position
    goToCurrentSlide() {
        const slides = document.querySelectorAll('.tiktok-slide');
        const currentSlide = slides[FeedManager.currentIndex];
        
        if (currentSlide) {
            currentSlide.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            this.updateIndicators();
        }
    },
    
    // Update slide indicators
    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === FeedManager.currentIndex);
        });
    },
    
    // Load more content
    async loadMoreContent() {
        if (!FeedManager.hasMore || FeedManager.isLoading) return;
        
        try {
            const newProducts = await FeedManager.loadFeed(
                FeedManager.currentFeedType,
                FeedManager.currentFeed.length,
                TIKTOK_CONFIG.slidesPerLoad
            );
            
            if (newProducts.length > 0) {
                FeedManager.addProducts(newProducts);
                this.appendSlides(newProducts);
            }
        } catch (error) {
            console.error('Error loading more content:', error);
        }
    },
    
    // Append new slides to feed
    appendSlides(products) {
        const feed = document.getElementById('tiktokFeed');
        const container = feed.querySelector('.tiktok-slides') || feed;
        
        products.forEach((product, index) => {
            const slide = this.createProductSlide(product, FeedManager.currentFeed.length - products.length + index);
            container.appendChild(slide);
        });
        
        // Update indicators
        this.updateIndicators();
    },
    
    // Track slide view for analytics
    trackSlideView() {
        const product = FeedManager.getCurrentProduct();
        if (product) {
            SocialInteractions.trackView(product.id);
        }
    },
    
    // Image carousel navigation (for products with multiple images)
    nextImage() {
        const currentSlide = document.querySelector('.tiktok-slide.active');
        const carousel = currentSlide?.querySelector('.product-image-carousel');
        
        if (carousel) {
            const currentTransform = carousel.style.transform || 'translateX(0%)';
            const currentX = parseInt(currentTransform.match(/-?\d+/)?.[0] || '0');
            const newX = currentX - 100; // Move to next image
            
            carousel.style.transform = `translateX(${newX}%)`;
        }
    },
    
    prevImage() {
        const currentSlide = document.querySelector('.tiktok-slide.active');
        const carousel = currentSlide?.querySelector('.product-image-carousel');
        
        if (carousel) {
            const currentTransform = carousel.style.transform || 'translateX(0%)';
            const currentX = parseInt(currentTransform.match(/-?\d+/)?.[0] || '0');
            const newX = Math.min(currentX + 100, 0); // Move to previous image
            
            carousel.style.transform = `translateX(${newX}%)`;
        }
    }
};

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Performance manager for smooth scrolling and lazy loading
 */
const PerformanceManager = {
    // Intersection Observer for lazy loading
    observer: null,
    
    // Initialize performance optimizations
    init() {
        this.setupIntersectionObserver();
        this.setupImageLazyLoading();
        this.setupScrollOptimization();
    },
    
    // Setup intersection observer
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load slide content
                    this.loadSlideContent(entry.target);
                    
                    // Start tracking view time
                    this.startViewTracking(entry.target);
                } else {
                    // Stop tracking view time
                    this.stopViewTracking(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '50px'
        });
    },
    
    // Setup image lazy loading
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    },
    
    // Setup scroll optimization
    setupScrollOptimization() {
        let ticking = false;
        
        const updateOnScroll = () => {
            this.updateVisibleSlides();
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        };
        
        document.addEventListener('scroll', onScroll, { passive: true });
    },
    
    // Load slide content when visible
    loadSlideContent(slide) {
        const productImages = slide.querySelectorAll('img[data-src]');
        productImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    },
    
    // Start tracking view time
    startViewTracking(slide) {
        const productId = slide.dataset.productId;
        if (productId) {
            SocialInteractions.trackView(parseInt(productId));
        }
    },
    
    // Stop tracking view time
    stopViewTracking(slide) {
        // Could implement pause/resume for video content here
    },
    
    // Update visible slides for performance
    updateVisibleSlides() {
        const slides = document.querySelectorAll('.tiktok-slide');
        
        slides.forEach(slide => {
            const rect = slide.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                slide.classList.add('visible');
            } else {
                slide.classList.remove('visible');
            }
        });
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate random social counts for demonstration
 */
function generateRandomCount(min = 10, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format social count with appropriate suffixes
 */
function formatSocialCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

/**
 * Simulate real-time updates for demonstration
 */
function simulateRealTimeUpdate(type, action, data) {
    // This would typically connect to a real-time service like Firebase
    // For demo purposes, we'll simulate updates with localStorage
    
    const updateData = {
        type: type,
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        user: currentUser?.email || 'anonymous'
    };
    
    const updates = JSON.parse(localStorage.getItem('dx_realtime_updates') || '[]');
    updates.push(updateData);
    
    // Keep only recent updates
    if (updates.length > 50) {
        updates.splice(0, updates.length - 50);
    }
    
    localStorage.setItem('dx_realtime_updates', JSON.stringify(updates));
    
    // You could trigger UI updates here based on the update type
    // For example, updating follower counts, like counts, etc.
}

/**
 * Create product slide with optimized rendering
 */
function createProductSlide(product, index) {
    const slide = document.createElement('div');
    slide.className = 'tiktok-slide slide-transition';
    slide.dataset.productId = product.id;
    slide.dataset.index = index;
    
    // Lazy load images
    const imageSrc = index < 3 ? product.image : ''; // Load first 3 images immediately
    
    slide.innerHTML = `
        <!-- Product Media -->
        <div class="product-media">
            <img src="${imageSrc}" alt="${product.name}" class="product-image-carousel" loading="lazy" ${imageSrc ? '' : `data-src="${product.image}"`}>
            
            <!-- Video Overlay -->
            <div class="video-overlay" onclick="toggleVideoPlayback(this)">
                <div class="play-button">
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Bottom Product Info -->
        <div class="bottom-info">
            <div class="product-details">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-features">
                    ${product.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('')}
                </div>
                
                <div class="product-price">${formatCurrency(product.price)}</div>
                
                <div class="product-stats">
                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                        <span>${product.rating}</span>
                    </div>
                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>${formatSocialCount(generateRandomCount(50, 500))}</span>
                    </div>
                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23,4 23,10 17,10"/>
                            <polyline points="1,20 1,14 7,14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        <span>${formatSocialCount(generateRandomCount(10, 200))}</span>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn-action btn-primary-action" onclick="addToCartFromTikTok(${product.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                </button>
                <button class="btn-action btn-secondary-action" onclick="viewProductDetails(${product.id})">
                    View Details
                </button>
            </div>
        </div>
        
        <!-- Right Rail Interactions -->
        <div class="right-rail">
            <div class="rail-item">
                <button class="rail-button ${SocialInteractions.isLiked(product.id) ? 'liked' : ''}" onclick="SocialInteractions.likeProduct(${product.id}, this)">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <span class="rail-count">${formatSocialCount(generateRandomCount(10, 1000))}</span>
            </div>
            
            <div class="rail-item">
                <button class="rail-button" onclick="showComments(${product.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </button>
                <span class="rail-count">${formatSocialCount(generateRandomCount(1, 50))}</span>
            </div>
            
            <div class="rail-item">
                <button class="rail-button ${SocialInteractions.isShared(product.id) ? 'shared' : ''}" onclick="SocialInteractions.shareProduct(${product.id}, this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                </button>
                <span class="rail-count">${formatSocialCount(generateRandomCount(5, 200))}</span>
            </div>
            
            <div class="rail-item">
                <button class="rail-button ${SocialInteractions.isFollowed((index % 4) + 1) ? 'followed' : ''}" onclick="SocialInteractions.followVendor(${(index % 4) + 1}, this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <path d="M20 8v6"/>
                        <path d="M23 11l-3 3-3-3"/>
                    </svg>
                </button>
                <span class="rail-count">${formatSocialCount(generateRandomCount(1000, 25000))}</span>
            </div>
            
            <div class="vendor-info">
                <img src="https://images.unsplash.com/photo-${1472099645785 + index}?w=100&h=100&fit=crop&crop=face" alt="Vendor" class="vendor-avatar" loading="lazy">
                <div class="vendor-name">Vendor ${index + 1}</div>
            </div>
        </div>
    `;
    
    return slide;
}

// ========================================
// INITIALIZATION
// ========================================

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gesture handling
    GestureManager.init();
    
    // Initialize performance optimizations
    PerformanceManager.init();
    
    console.log('🎬 TikTok Dashboard JavaScript loaded!');
    console.log('👆 Gesture handling active');
    console.log('⚡ Performance optimizations enabled');
    console.log('💱 Philippine Peso social commerce');
});

// Export for global access
window.TikTokDashboard = {
    FeedManager,
    SocialInteractions,
    GestureManager,
    PerformanceManager,
    
    // Utility functions
    createProductSlide,
    generateRandomCount,
    formatSocialCount,
    simulateRealTimeUpdate
};