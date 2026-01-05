// Main JavaScript for Manar Al Hikamah Trading LLC Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initHeroAnimation();
    initScrollAnimations();
    initMobileMenu();
    initContactForm();
    initCounters();
    initImageLazyLoading();
});

/**
 * Hero Background Animation - Geometric Steel/Scaffold Shape
 * Uses Tailwind CSS + Vanilla JS (no canvas)
 * Features: bouncing, wall collision transforms, mouse interaction, drag with inertia
 */
function initHeroAnimation() {
    const container = document.getElementById('heroAnimationContainer');
    const shape = document.getElementById('geometricShape');
    const shapeInner = document.getElementById('shapeInner');
    const shapeGlow = document.getElementById('shapeGlow');
    const rippleContainer = document.getElementById('rippleContainer');
    
    if (!container || !shape) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    
    // Animation state
    const state = {
        x: container.offsetWidth / 2,
        y: container.offsetHeight / 2,
        vx: isMobile ? 0.8 : 1.5,
        vy: isMobile ? 0.6 : 1.2,
        rotation: 0,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        inertia: { x: 0, y: 0 },
        lastMousePos: { x: 0, y: 0 },
        shapeVariant: 0,
        lastCollision: 0,
        animationId: null
    };
    
    // Shape variants for collision transforms
    const shapeVariants = [
        { borderRadius: '0px', borderWidth: '4px', pattern: 'scaffold' },
        { borderRadius: '12px', borderWidth: '3px', pattern: 'rounded' },
        { borderRadius: '50%', borderWidth: '2px', pattern: 'circle' },
        { borderRadius: '4px', borderWidth: '6px', pattern: 'thick' }
    ];
    
    // Color palette from logo theme
    const colors = [
        'rgba(249, 115, 22, 0.6)',  // brand-orange
        'rgba(30, 58, 95, 0.8)',     // brand-navy
        'rgba(255, 255, 255, 0.4)',  // white
        'rgba(249, 115, 22, 0.8)'    // brand-orange bright
    ];
    
    // Get shape size
    function getShapeSize() {
        return shape.offsetWidth;
    }
    
    // Update shape position
    function updatePosition() {
        shape.style.left = `${state.x}px`;
        shape.style.top = `${state.y}px`;
        shape.style.transform = `translate(-50%, -50%) rotate(${state.rotation}deg)`;
    }
    
    // Apply shape variant on collision
    function applyShapeVariant(variantIndex) {
        const variant = shapeVariants[variantIndex];
        const color = colors[variantIndex];
        
        shapeInner.style.borderRadius = variant.borderRadius;
        shapeInner.style.borderWidth = variant.borderWidth;
        shapeInner.style.borderColor = color;
        shape.style.borderRadius = variant.borderRadius;
    }
    
    // Create ripple effect at collision point
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'absolute rounded-full border-2 border-brand-orange/40 pointer-events-none';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = '0px';
        ripple.style.height = '0px';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.transition = 'all 0.8s ease-out';
        ripple.style.opacity = '0.6';
        
        rippleContainer.appendChild(ripple);
        
        // Trigger animation
        requestAnimationFrame(() => {
            ripple.style.width = '150px';
            ripple.style.height = '150px';
            ripple.style.opacity = '0';
        });
        
        // Cleanup
        setTimeout(() => ripple.remove(), 800);
    }
    
    // Create pulse effect on click
    function createPulse() {
        shapeGlow.style.opacity = '1';
        shape.style.transform = `translate(-50%, -50%) rotate(${state.rotation}deg) scale(1.15)`;
        
        setTimeout(() => {
            shapeGlow.style.opacity = '0';
            shape.style.transform = `translate(-50%, -50%) rotate(${state.rotation}deg) scale(1)`;
        }, 200);
    }
    
    // Handle wall collision
    function handleCollision(wall) {
        const now = Date.now();
        if (now - state.lastCollision < 400) return; // Debounce
        
        state.lastCollision = now;
        state.shapeVariant = (state.shapeVariant + 1) % shapeVariants.length;
        
        applyShapeVariant(state.shapeVariant);
        createRipple(state.x, state.y);
        
        // Brief glow on collision
        shapeGlow.style.opacity = '0.6';
        setTimeout(() => shapeGlow.style.opacity = '0', 300);
    }
    
    // Mouse attraction/repulsion effect
    let lastMouseMove = 0;
    function handleMouseInfluence(mouseX, mouseY) {
        if (state.isDragging || prefersReducedMotion) return;
        
        const now = Date.now();
        if (now - lastMouseMove < 50) return; // Throttle
        lastMouseMove = now;
        
        const dx = mouseX - state.x;
        const dy = mouseY - state.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Subtle attraction when mouse is within range
        if (distance < 200 && distance > 50) {
            const force = 0.02;
            state.vx += (dx / distance) * force;
            state.vy += (dy / distance) * force;
            
            // Clamp velocity
            const maxSpeed = 3;
            const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
            if (speed > maxSpeed) {
                state.vx = (state.vx / speed) * maxSpeed;
                state.vy = (state.vy / speed) * maxSpeed;
            }
        }
    }
    
    // Main animation loop
    function animate() {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const size = getShapeSize();
        const halfSize = size / 2;
        
        if (!state.isDragging) {
            // Apply velocity and inertia
            state.x += state.vx + state.inertia.x;
            state.y += state.vy + state.inertia.y;
            
            // Apply friction to inertia
            state.inertia.x *= 0.95;
            state.inertia.y *= 0.95;
            
            // Boundary collision detection
            if (state.x <= halfSize) {
                state.x = halfSize;
                state.vx *= -0.85;
                handleCollision('left');
            } else if (state.x >= containerWidth - halfSize) {
                state.x = containerWidth - halfSize;
                state.vx *= -0.85;
                handleCollision('right');
            }
            
            if (state.y <= halfSize) {
                state.y = halfSize;
                state.vy *= -0.85;
                handleCollision('top');
            } else if (state.y >= containerHeight - halfSize) {
                state.y = containerHeight - halfSize;
                state.vy *= -0.85;
                handleCollision('bottom');
            }
        }
        
        // Slow rotation
        state.rotation += prefersReducedMotion ? 0 : 0.3;
        
        updatePosition();
        state.animationId = requestAnimationFrame(animate);
    }
    
    // Mouse/Touch event handlers
    function getEventCoords(e) {
        const rect = container.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    function isInsideShape(x, y) {
        const size = getShapeSize();
        return Math.abs(x - state.x) <= size / 2 && Math.abs(y - state.y) <= size / 2;
    }
    
    // Desktop interactions
    if (!isMobile) {
        container.addEventListener('mousedown', (e) => {
            const coords = getEventCoords(e);
            if (isInsideShape(coords.x, coords.y)) {
                state.isDragging = true;
                state.dragOffset.x = coords.x - state.x;
                state.dragOffset.y = coords.y - state.y;
                state.lastMousePos = { x: coords.x, y: coords.y };
                shape.style.cursor = 'grabbing';
                shapeGlow.style.opacity = '0.4';
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            const coords = getEventCoords(e);
            
            if (state.isDragging) {
                const newX = coords.x - state.dragOffset.x;
                const newY = coords.y - state.dragOffset.y;
                
                // Calculate inertia from drag movement
                state.inertia.x = (newX - state.x) * 0.4;
                state.inertia.y = (newY - state.y) * 0.4;
                
                state.x = newX;
                state.y = newY;
                state.lastMousePos = { x: coords.x, y: coords.y };
            } else {
                // Mouse influence on shape movement
                handleMouseInfluence(coords.x, coords.y);
                
                // Hover glow effect
                if (isInsideShape(coords.x, coords.y)) {
                    shapeGlow.style.opacity = '0.3';
                    shape.style.cursor = 'grab';
                } else {
                    shapeGlow.style.opacity = '0';
                    shape.style.cursor = 'default';
                }
            }
        });
        
        container.addEventListener('mouseup', () => {
            if (state.isDragging) {
                state.isDragging = false;
                shape.style.cursor = 'grab';
                shapeGlow.style.opacity = '0';
            }
        });
        
        container.addEventListener('mouseleave', () => {
            if (state.isDragging) {
                state.isDragging = false;
                shapeGlow.style.opacity = '0';
            }
        });
        
        // Click pulse effect
        shape.addEventListener('click', (e) => {
            if (!state.isDragging) {
                createPulse();
                state.shapeVariant = (state.shapeVariant + 1) % shapeVariants.length;
                applyShapeVariant(state.shapeVariant);
            }
        });
    }
    
    // Mobile touch interactions (simplified)
    if (isMobile && !prefersReducedMotion) {
        let touchStartTime = 0;
        
        container.addEventListener('touchstart', (e) => {
            const coords = getEventCoords(e);
            if (isInsideShape(coords.x, coords.y)) {
                touchStartTime = Date.now();
                state.isDragging = true;
                state.dragOffset.x = coords.x - state.x;
                state.dragOffset.y = coords.y - state.y;
                shapeGlow.style.opacity = '0.4';
            }
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            if (state.isDragging) {
                const coords = getEventCoords(e);
                const newX = coords.x - state.dragOffset.x;
                const newY = coords.y - state.dragOffset.y;
                
                state.inertia.x = (newX - state.x) * 0.3;
                state.inertia.y = (newY - state.y) * 0.3;
                
                state.x = newX;
                state.y = newY;
            }
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            if (state.isDragging) {
                // Tap detection for pulse
                if (Date.now() - touchStartTime < 200) {
                    createPulse();
                    state.shapeVariant = (state.shapeVariant + 1) % shapeVariants.length;
                    applyShapeVariant(state.shapeVariant);
                }
                state.isDragging = false;
                shapeGlow.style.opacity = '0';
            }
        }, { passive: true });
    }
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Keep shape within bounds after resize
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const halfSize = getShapeSize() / 2;
            
            state.x = Math.max(halfSize, Math.min(containerWidth - halfSize, state.x));
            state.y = Math.max(halfSize, Math.min(containerHeight - halfSize, state.y));
        }, 100);
    });
    
    // Start animation (skip if reduced motion preferred)
    if (!prefersReducedMotion) {
        animate();
    } else {
        // Static centered position for reduced motion
        state.x = container.offsetWidth / 2;
        state.y = container.offsetHeight / 2;
        updatePosition();
    }
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animation if it's a counter element
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.material-card, .service-card, .certification-card');
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
            
            // Toggle hamburger icon
            const icon = this.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('active');
                const icon = mobileMenuButton.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.classList.add('btn-loading');
            submitButton.disabled = true;
            
            // Collect form data
            const formData = new FormData(this);
            
            // Simulate form submission (replace with actual endpoint)
            fetch('contact-handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Thank you! Your message has been sent successfully.', 'success');
                    this.reset();
                } else {
                    showAlert('Sorry, there was an error sending your message. Please try again.', 'error');
                }
            })
            .catch(error => {
                showAlert('Sorry, there was an error sending your message. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
        });
    }
}

// Counter animation
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        counter.classList.add('fade-in');
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        const suffix = element.textContent.replace(/[\d]/g, '');
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Image lazy loading
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Utility functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.alert-container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Smooth reveal animation for elements
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Add scroll event listener with debounce
window.addEventListener('scroll', debounce(revealOnScroll, 10));

// Page loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Handle dropdown menus
document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('active');
        }
        
        // Close dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}