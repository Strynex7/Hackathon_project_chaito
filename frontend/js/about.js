/**
 * CryptoKindOnly About Page JavaScript
 * Handles animations and interactive elements on the About page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu functionality
    initMobileMenu();
    
    // Initialize animations
    initAnimations();
    
    // Initialize roadmap hover effects
    initRoadmapEffects();
});

/**
 * Initialize mobile menu toggle functionality
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Initialize animations for page elements
 */
function initAnimations() {
    // Animate team cards on scroll
    const teamCards = document.querySelectorAll('.bg-gray-800.rounded-lg.overflow-hidden');
    
    // Create an intersection observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slideIn-animation');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Observe each team card
    teamCards.forEach(card => {
        observer.observe(card);
    });
    
    // Animate value cards on hover
    const valueCards = document.querySelectorAll('.bg-gray-800.rounded-lg.p-6.shadow-lg.border');
    valueCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('pulse-animation');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('pulse-animation');
        });
    });
}

/**
 * Initialize roadmap timeline hover effects
 */
function initRoadmapEffects() {
    const timelineItems = document.querySelectorAll('.order-1.bg-gray-800.rounded-lg.shadow-xl.w-5\/12');
    
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('border-green-400');
            this.classList.remove('border-gray-700');
            
            // Find the associated circle and change its color
            const parentDiv = this.parentElement;
            const circle = parentDiv.querySelector('.z-10.flex.items-center.order-1');
            if (circle) {
                if (circle.classList.contains('bg-gray-700')) {
                    circle.classList.remove('bg-gray-700');
                    circle.classList.add('bg-green-400');
                }
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('border-green-400');
            this.classList.add('border-gray-700');
            
            // Find the associated circle and revert its color if it's a future item
            const parentDiv = this.parentElement;
            const circle = parentDiv.querySelector('.z-10.flex.items-center.order-1');
            if (circle) {
                // Check if this is a future roadmap item (items 4 and 5)
                const itemNumber = parseInt(circle.querySelector('h1').textContent);
                if (itemNumber > 3) {
                    circle.classList.add('bg-gray-700');
                    circle.classList.remove('bg-green-400');
                }
            }
        });
    });
}

/**
 * Add a smooth scroll effect for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

/**
 * Handle newsletter subscription form
 */
const subscribeForm = document.querySelector('.flex input[type="email"]')?.parentElement;
if (subscribeForm) {
    const emailInput = subscribeForm.querySelector('input[type="email"]');
    const subscribeButton = subscribeForm.querySelector('button');
    
    subscribeButton.addEventListener('click', function() {
        const email = emailInput.value.trim();
        
        if (email && isValidEmail(email)) {
            // Simulate successful subscription
            emailInput.value = '';
            showMessage('Thanks for subscribing!', 'success');
        } else {
            // Show error message
            showMessage('Please enter a valid email address', 'error');
        }
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Show a message to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
    messageDiv.textContent = message;
    
    // Add to document
    document.body.appendChild(messageDiv);
    
    // Add entrance animation
    setTimeout(() => {
        messageDiv.classList.add('slideIn-animation');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}