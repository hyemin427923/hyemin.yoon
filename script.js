document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. Header Scroll Effect
    // ==========================================================================
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // 2. Mobile Menu Toggle
    // ==========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.style.display === 'block';
        if (isOpen) {
            mobileNav.style.display = 'none';
            mobileMenuIcon.className = 'fa-solid fa-bars';
        } else {
            mobileNav.style.display = 'block';
            mobileMenuIcon.className = 'fa-solid fa-xmark';
        }
    });

    // Close mobile menu when a link is clicked
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.style.display = 'none';
            mobileMenuIcon.className = 'fa-solid fa-bars';
        });
    });

    // ==========================================================================
    // 3. Active Link Highlight on Scroll (Scrollspy) & Skill Bar Animation
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const skillProgressBars = document.querySelectorAll('.skill-progress');

    // Store final progress width and set initial state to 0% for animation
    const progressWidths = [];
    skillProgressBars.forEach((bar, index) => {
        progressWidths[index] = bar.style.width;
        bar.style.width = '0%';
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle portion of the screen
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Highlight corresponding nav link
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                // Trigger skill progress animation if skills section is entered
                if (id === 'skills') {
                    skillProgressBars.forEach((bar, index) => {
                        bar.style.width = progressWidths[index];
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ==========================================================================
    // 4. Smooth Scrolling for Anchor Links (Backup if HTML smooth scroll is not supported)
    // ==========================================================================
    const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .hero-actions a, .scroll-down-indicator, .logo a');
    
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
