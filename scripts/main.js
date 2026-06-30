// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (navbar) {
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const isDecimal = end % 1 !== 0;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        if (isDecimal) {
            element.textContent = current.toFixed(2);
        } else {
            element.textContent = Math.floor(current);
        }
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = isDecimal ? end.toFixed(2) : end;
        }
    };
    window.requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const target = parseFloat(statNumber.getAttribute('data-target'));
            if (!isNaN(target)) {
                animateValue(statNumber, 0, target, 2000);
                statObserver.unobserve(statNumber);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

// Animate GPA on scroll
const gpaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const gpaNumber = entry.target;
            const target = parseFloat(gpaNumber.getAttribute('data-target'));
            if (!isNaN(target)) {
                animateValue(gpaNumber, 0, target, 2000);
                gpaObserver.unobserve(gpaNumber);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.gpa-number').forEach(gpa => {
    gpaObserver.observe(gpa);
});

// Parallax effect for hero section
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Add scroll animation to sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    sectionObserver.observe(section);
});

// Form submission - Formspree integration
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showSuccessModal();
                contactForm.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    throw new Error(data.errors.map(error => error.message).join(', '));
                } else {
                    throw new Error('Form submission failed');
                }
            }
        } catch (error) {
            alert('Sorry, there was an error sending your message. Please try again or email me directly at somil.d@myjobflows.com');
            console.error('Form submission error:', error);
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Success Modal Functions
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close modal when clicking the close button
const closeModalBtn = document.getElementById('close-success-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideSuccessModal);
}

// Close modal when clicking outside the modal content
const successModal = document.getElementById('success-modal');
if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideSuccessModal();
    }
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
    let current = '';
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink(); // Call once on load

// Logo click to scroll to top
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Add fade-in animation to skill cards and project cards
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            cardObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.skill-card, .project-card, .timeline-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
});

// ── 3D Tilt — all cards ────────────────────────────────────────────────────────
function initTilt() {
    document.querySelectorAll('.project-card, .education-item, .timeline-item, .skill-card, .cert-card, .publication-card').forEach(card => {
        card.classList.add('tilt-card');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
            const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
            card.style.transition = 'transform 0.08s ease';
            card.style.transform =
                `perspective(900px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) translateY(-6px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        });
    });
}

initTilt();

// ── Hero photo — multi-layer parallax ────────────────────────────────────────
(function () {
    const scene = document.getElementById('photo-scene');
    const glow  = document.getElementById('photo-glow');
    const frame = document.querySelector('.hero-photo-frame');
    const img   = document.getElementById('profile-image');
    if (!scene || !frame || !img) return;

    // Smooth interpolated values for each layer
    let tx = 0, ty = 0;         // target (raw mouse offset)
    let g  = { x: 0, y: 0 };   // glow  — slow, opposite
    let fr = { x: 0, y: 0 };   // frame — medium
    let im = { x: 0, y: 0 };   // image — fast (most depth)

    document.addEventListener('mousemove', (e) => {
        // Normalise to -1 … +1 relative to viewport centre
        tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    (function loop() {
        // Each layer chases at different speeds → depth illusion
        g.x  = lerp(g.x,  tx * -14, 0.04);   // glow: slow, counter-direction
        g.y  = lerp(g.y,  ty * -14, 0.04);
        fr.x = lerp(fr.x, tx *  10, 0.07);   // frame: medium
        fr.y = lerp(fr.y, ty *  10, 0.07);
        im.x = lerp(im.x, tx *  18, 0.10);   // image: fastest
        im.y = lerp(im.y, ty *  18, 0.10);

        if (glow)  glow.style.transform  = `translate(${g.x}px, ${g.y}px)`;
        frame.style.transform = `translate(${fr.x}px, ${fr.y}px)`;
        img.style.transform   = `translate(${im.x - fr.x}px, ${im.y - fr.y}px) scale(1.08)`;

        requestAnimationFrame(loop);
    })();
})();

// ── Custom cursor ─────────────────────────────────────────────────────────────
(function () {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let mx = 0, my = 0; // mouse position
    let rx = 0, ry = 0; // ring (lagged)

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    });

    (function ringLoop() {
        // Smooth lag — ring chases mouse at 10% per frame
        rx += (mx - rx) * 0.10;
        ry += (my - ry) * 0.10;
        ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
        requestAnimationFrame(ringLoop);
    })();

    // Hover state on interactive elements
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .btn, .nav-link, .role-pill, .skill-tags span, .project-card, .cert-card, .publication-card, .social-link')) {
            document.body.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .btn, .nav-link, .role-pill, .skill-tags span, .project-card, .cert-card, .publication-card, .social-link')) {
            document.body.classList.remove('cursor-hover');
        }
    });

    // Click shrink effect
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    // Hide on leave, show on enter
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// Prevent scroll when mobile menu is open
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Reset overflow when menu closes
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.body.style.overflow = '';
        });
    });
}

