document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on load for hero section
    setTimeout(() => {
        const h1 = document.querySelector('.hero h1');
        if (h1) {
            h1.style.transition = 'all 1s cubic-bezier(0.1, 0.5, 0.2, 1)';
            h1.style.opacity = '1';
            h1.style.transform = 'translateY(0)';
        }
    }, 100);

    setTimeout(() => {
        const p = document.querySelector('.hero p');
        if (p) {
            p.style.transition = 'all 1s cubic-bezier(0.1, 0.5, 0.2, 1)';
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
        }
    }, 300);

    setTimeout(() => {
        const btns = document.querySelector('.hero-btns');
        if (btns) {
            btns.style.transition = 'all 1s cubic-bezier(0.1, 0.5, 0.2, 1)';
            btns.style.opacity = '1';
            btns.style.transform = 'translateY(0)';
        }
    }, 500);

    // Scroll reveal for other sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'all 0.8s cubic-bezier(0.1, 0.5, 0.2, 1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.feature-card, .showcase-item');
    revealElements.forEach(el => observer.observe(el));

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'rgba(25, 25, 25, 0.6)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        }
    });
});
