// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize FAQ accordions
    initFaqAccordions();
    
    // Initialize contact form
    initContactForm();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// FAQ Accordion Functionality
function initFaqAccordions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle the answer visibility
            const answer = this.nextElementSibling;
            answer.classList.toggle('hidden');
            
            // Toggle the arrow icon
            const arrow = this.querySelector('svg');
            arrow.classList.toggle('rotate-180');
            
            // Add a subtle animation to the answer
            if (!answer.classList.contains('hidden')) {
                answer.style.maxHeight = '0';
                setTimeout(() => {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }, 10);
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
}

// Contact Form Handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate form
            if (!validateForm(name, email, subject, message)) {
                return;
            }
            
            // Simulate form submission (in a real app, this would be an API call)
            simulateFormSubmission(name, email, subject, message);
        });
    }
}

// Form Validation
function validateForm(name, email, subject, message) {
    let isValid = true;
    
    // Reset previous error messages
    clearErrorMessages();
    
    // Validate name
    if (name === '') {
        displayErrorMessage('name', 'Please enter your name');
        isValid = false;
    }
    
    // Validate email
    if (email === '') {
        displayErrorMessage('email', 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        displayErrorMessage('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate subject
    if (subject === '') {
        displayErrorMessage('subject', 'Please enter a subject');
        isValid = false;
    }
    
    // Validate message
    if (message === '') {
        displayErrorMessage('message', 'Please enter your message');
        isValid = false;
    } else if (message.length < 10) {
        displayErrorMessage('message', 'Your message is too short (minimum 10 characters)');
        isValid = false;
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Display error message under input field
function displayErrorMessage(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorDiv = document.createElement('div');
    
    errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
    errorDiv.textContent = message;
    
    // Add error styling to input
    inputElement.classList.add('border-red-500');
    
    // Insert error message after input
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
}

// Clear all error messages
function clearErrorMessages() {
    // Remove all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
    
    // Remove error styling from inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.classList.remove('border-red-500'));
}

// Simulate form submission (in a real app, this would be an API call)
function simulateFormSubmission(name, email, subject, message) {
    // Show loading state
    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset form
        document.getElementById('contact-form').reset();
        
        // Show success message
        showNotification('Your message has been sent successfully! We will get back to you soon.', 'success');
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        // Log to console (for demo purposes)
        console.log('Form submitted:', { name, email, subject, message });
    }, 1500);
}

// Show notification message
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white max-w-md transform transition-all duration-500 translate-y-20 opacity-0`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}