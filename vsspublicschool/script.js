document.addEventListener('DOMContentLoaded', function() {
    const App = {
        init() {
            // Show loader
            document.body.style.overflow = 'hidden';
            window.addEventListener('load', () => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 500);
            });

            // Scroll to top button
            const scrollBtn = document.getElementById('scroll-top');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
            });
            
            scrollBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // Initialize other functions
            this.initMobileMenu();
            this.initSlider();
            this.initNoticeBoard();
            this.initAssignments();
            this.initNavigation();
            this.handleHashScroll();
            this.initScrollAnimation();
            this.initThemeToggle();
            this.initHeroSlider();
            this.initScrollProgress();
            this.initMarqueeText(); // Initialize marquee text
        },

        // Mobile Menu
        initMobileMenu() {
            const menuBtn = document.querySelector('.mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);

            menuBtn.addEventListener('click', () => {
                menuBtn.classList.toggle('active');
                menuBtn.innerHTML = menuBtn.classList.contains('active') ? '✕' : '☰';
                navLinks.classList.toggle('active');
                overlay.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            });

            // Handle navigation links including the contact link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.classList.contains('contact-link')) {
                        e.preventDefault();
                        const contactSection = document.querySelector('#contact');
                        if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                    menuBtn.classList.remove('active');
                    menuBtn.innerHTML = '☰';
                    navLinks.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });

            overlay.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                menuBtn.innerHTML = '☰';
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        },

        // Image Slider
        initSlider() {
            const sliders = document.querySelectorAll('.slider');
            if (!sliders.length) return;

            sliders.forEach(slider => {
                const images = slider.querySelectorAll('img');
                if (!images.length) return;

                let currentIndex = 0;
                const dots = this.createSliderDots(images.length);
                slider.appendChild(dots);

                const showImage = (index) => {
                    images.forEach(img => img.classList.remove('active'));
                    dots.querySelectorAll('.slider-dot').forEach(dot => dot.classList.remove('active'));
                    images[index].classList.add('active');
                    dots.children[index].classList.add('active');
                };

                // Auto-advance
                const autoAdvance = () => {
                    currentIndex = (currentIndex + 1) % images.length;
                    showImage(currentIndex);
                };
                let autoAdvanceInterval = setInterval(autoAdvance, 5000);

                // Dot navigation
                dots.querySelectorAll('.slider-dot').forEach((dot, idx) => {
                    dot.addEventListener('click', () => {
                        currentIndex = idx;
                        showImage(currentIndex);
                        clearInterval(autoAdvanceInterval);
                        autoAdvanceInterval = setInterval(autoAdvance, 5000);
                    });
                });

                // Add touch support for mobile
                let touchStartX = 0;
                let touchEndX = 0;

                slider.addEventListener('touchstart', e => {
                    touchStartX = e.changedTouches[0].screenX;
                });

                slider.addEventListener('touchend', e => {
                    touchEndX = e.changedTouches[0].screenX;
                    if (touchStartX - touchEndX > 50) {
                        // Swipe left
                        currentIndex = (currentIndex + 1) % images.length;
                    } else if (touchEndX - touchStartX > 50) {
                        // Swipe right
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                    }
                    showImage(currentIndex);
                    clearInterval(autoAdvanceInterval);
                    autoAdvanceInterval = setInterval(autoAdvance, 5000);
                });
            });
        },

        createSliderDots(count) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-dots';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dotsContainer.appendChild(dot);
            }
            return dotsContainer;
        },

        // Notice Board
        initNoticeBoard() {
            const noticeBoard = document.querySelector('.notice-board');
            if (!noticeBoard) return;

            const notices = [
                { title: 'Parent-Teacher Meeting', date: '2024-02-20', priority: 'high', description: 'Annual PTM for all classes. Attendance is mandatory.' },
                { title: 'Annual Sports Day', date: '2024-03-15', priority: 'medium', description: 'Get ready for an exciting day of sports and activities!' },
                { title: 'New Admission Open', date: '2024-02-25', priority: 'high', description: 'Admissions open for academic year 2024-25' },
                { title: 'Winter Vacation', date: '2024-12-25', priority: 'medium', description: 'School closed for winter break' }
            ];

            noticeBoard.innerHTML = notices.map(notice => `
                <div class="notice-item ${notice.priority}" data-aos="fade-up">
                    <span class="notice-title">${notice.title}</span>
                    <p class="notice-description">${notice.description}</p>
                    <span class="notice-date">📅 ${new Date(notice.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}</span>
                </div>
            `).join('');

            // Adjust animation and layout
            const noticeItems = document.querySelectorAll('.notice-item');
            noticeItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        },

        // Assignments
        initAssignments() {
            const assignmentsList = document.querySelector('.assignments-list');
            if (!assignmentsList) return;

            const filterAssignments = () => {
                const classValue = document.getElementById('classFilter')?.value || 'all';
                const subjectValue = document.getElementById('subjectFilter')?.value || 'all';

                const assignments = this.getAssignments()
                    .filter(a => (classValue === 'all' || a.class === classValue))
                    .filter(a => (subjectValue === 'all' || a.subject === subjectValue));

                this.renderAssignments(assignments, assignmentsList);
            };

            ['classFilter', 'subjectFilter'].forEach(id => {
                document.getElementById(id)?.addEventListener('change', filterAssignments);
            });

            filterAssignments();
        },

        getAssignments() {
            return [
                { class: 'nursery', subject: 'general', title: 'Weekly Activity', dueDate: '2024-02-20' },
                { class: 'kg', subject: 'english', title: 'Alphabet Practice', dueDate: '2024-02-21' },
                { class: '5', subject: 'science', title: 'Plant Life Cycle', dueDate: '2024-02-22' },
                { class: '8', subject: 'math', title: 'Algebra Basics', dueDate: '2024-02-23' }
            ];
        },

        renderAssignments(assignments, container) {
            container.innerHTML = assignments.length ? assignments.map(a => `
                <div class="assignment-card">
                    <h3>${a.title}</h3>
                    <p>Class ${a.class} - ${a.subject}</p>
                    <p>Due: ${new Date(a.dueDate).toLocaleDateString()}</p>
                    <button class="download-btn">Download</button>
                </div>
            `).join('') : '<p>No assignments found</p>';
        },

        // Navigation
        initNavigation() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-links a');
            
            // Update active state while scrolling
            window.addEventListener('scroll', () => {
                let currentSection = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.offsetHeight;
                    const sectionBottom = sectionTop + sectionHeight;
                    
                    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                        currentSection = section.getAttribute('id');
                        // Update mobile menu active states
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${currentSection}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });

                // Handle home link active state
                if (window.scrollY < 100) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#') {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },

        // Add this new method
        handleHashScroll() {
            if (window.location.hash) {
                setTimeout(() => {
                    const element = document.querySelector(window.location.hash);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);
            }
        },

        // Enhanced scroll animation
        initScrollAnimation() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.card, .vision, .mission, .plan-card, .section-title').forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });
        },

        initThemeToggle() {
            const toggleButton = document.querySelector('.theme-toggle');
            if (!toggleButton) return;

            toggleButton.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                toggleButton.textContent =
                    document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
            });
        },

        toggleChatPhase() {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.classList.toggle('phase2');
            }
        },

        initHeroSlider() {
            const heroSlider = document.querySelector('.hero-slider');
            if (!heroSlider) return;
        
            const images = heroSlider.querySelectorAll('img');
            let currentIndex = 0;
        
            function showSlide(index) {
                images.forEach(img => img.classList.remove('active'));
                images[index].classList.add('active');
                currentIndex = index;
            }
        
            // Auto advance
            const autoAdvance = () => {
                currentIndex = (currentIndex + 1) % images.length;
                showSlide(currentIndex);
            };
            setInterval(autoAdvance, 5000);
        },

        initScrollProgress() {
            const progress = document.querySelector('.scroll-progress');
            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const percentage = scrolled / maxScroll;
                progress.style.transform = `scaleX(${percentage})`;
            });
        },

        // Marquee text effect
        initMarqueeText() {
            const slidingText = document.getElementById('sliding-text');
            const staticText = document.getElementById('static-text');
            
            if (!slidingText || !staticText) return;

            const resetMarquee = () => {
                slidingText.style.display = 'block';
                slidingText.style.opacity = '1';
                staticText.style.display = 'none';
                staticText.style.opacity = '0';
                
                // Start animation with faster speed
                slidingText.style.animation = 'marquee 15s linear'; // Reduced from 22s to 15s
                
                // Listen for animation end
                slidingText.addEventListener('animationend', () => {
                    // Fade out sliding text
                    slidingText.style.opacity = '0';
                    setTimeout(() => {
                        slidingText.style.display = 'none';
                        // Show static text
                        staticText.style.display = 'block';
                        setTimeout(() => {
                            staticText.style.opacity = '1';
                        }, 50);
                    }, 300);
                }, { once: true });
            };

            // Initial start
            resetMarquee();

            // Reset on window resize
            window.addEventListener('resize', () => {
                resetMarquee();
            });
        }
    };

    // Initialize application
    App.init();

    // Add Intersection Observer logic and simple animation triggers
    const reveals = document.querySelectorAll('.reveal');

    const options = {
        root: null,
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    reveals.forEach(el => observer.observe(el));
});
