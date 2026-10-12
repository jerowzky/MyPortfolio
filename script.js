// Writing Code Background
    const texts = [
        "Web Development",
        "Project Management",
        "UI/UX Design",
        "Business Analysis",
        "Quality Assurance"
    ];

    const typingText = document.getElementById("typing-text");

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            speed = 1500;
            isDeleting = true;
        }

        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex++;

            if (textIndex === texts.length) {
                textIndex = 0;
            }

            speed = 500;
        }

        setTimeout(typeEffect, speed);
    }

    typeEffect();

const code = `
const portfolio = {

    name: "Jeruh Fornal",

    role: "IT Professional",

    skills: [
        "Frontend Development",
        "UI/UX Design",
        "Quality Assurance",
        "Business Analysis",
        "Project Management"
    ]

};


function createExperience(problem) {

    const idea = understand(problem);

    const design = createInterface(idea);

    const solution = develop(design);

    test(solution);

    return solution;
}


system.initialize();

experience.create();

interface.render();

user.interact();

solution.improve();
`;

const codeText = document.getElementById("code-text");

let index = 0;

function typeCode() {

    if (index < code.length) {

        codeText.textContent += code.charAt(index);

        index++;

        setTimeout(typeCode, 60);

    } else {

        setTimeout(() => {

            codeText.textContent = "";
            index = 0;

            typeCode();

        }, 2000);
    }
}

typeCode();

// Reveal Animation
const revealSelector =
    ".reveal-right, .reveal-right-tilted1, .reveal-right-tilted2, " +
    ".reveal-left, .reveal-left-tilted, .reveal-up, .reveal-title, " +
    ".reveal-headline, .highlight, .reveal-image, .reveal-left-card, " +
    ".reveal-right-card, .reveal-up-btn, .reveal-down-btn, .reveal-card";

const revealStates = new WeakMap();

let ticking = false;


// =========================
// GET HEADER HEIGHT
// =========================

function getHeaderHeight() {
    return window.innerWidth <= 500 ? 49 : 67;
}


// =========================
// UPDATE REVEALS
// =========================

function updateReveals() {

    const reveals = document.querySelectorAll(revealSelector);

    const viewportHeight = window.innerHeight;
    const headerHeight = getHeaderHeight();

    // =========================
    // SHOW ZONE
    // =========================

    const showTop = headerHeight + 30;
    const showBottom = viewportHeight * 0.85;


    reveals.forEach((element) => {

        // Initialize newly added elements
        if (!revealStates.has(element)) {
            revealStates.set(element, false);
        }

        const isShown = revealStates.get(element);

        const rect = element.getBoundingClientRect();


        // =========================
        // HIGHLIGHT
        // Show once and stay shown
        // =========================

        if (element.classList.contains("highlight")) {

            if (!isShown) {

                const shouldShow =
                    rect.bottom > showTop &&
                    rect.top < showBottom;

                if (shouldShow) {
                    element.classList.add("show");
                    revealStates.set(element, true);
                }

            }

            return;
        }


        // =========================
        // SHOW
        // =========================

        if (!isShown) {

            const shouldShow =
                rect.bottom > showTop &&
                rect.top < showBottom;

            if (shouldShow) {
                element.classList.add("show");
                revealStates.set(element, true);
            }

        }


        // =========================
        // HIDE
        // =========================

        else {

            // Element is completely above the visible area
            const clearlyAbove =
                rect.bottom <= headerHeight;

            // Element is completely below the viewport
            const clearlyBelow =
                rect.top >= viewportHeight;


            if (clearlyAbove || clearlyBelow) {

                element.classList.remove("show");
                revealStates.set(element, false);

            }

        }

    });

    ticking = false;
}


// =========================
// REQUEST UPDATE
// =========================

function requestRevealUpdate() {

    if (!ticking) {

        requestAnimationFrame(updateReveals);

        ticking = true;

    }

}


// =========================
// EVENTS
// =========================

window.addEventListener("scroll", requestRevealUpdate, {
    passive: true
});

window.addEventListener("resize", requestRevealUpdate);


// =========================
// INITIAL CHECK
// =========================

updateReveals();
// ================================
// Navigation Bar
// ================================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header nav a, .mobile-dropdown .mobile-nav-link");

function updateActiveNav() {

    let currentSection = "home";

    sections.forEach((section) => {

        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= window.innerHeight * 0.4) {
            currentSection = section.id;
        }

    });

    navLinks.forEach((link) => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (
            href === `#${currentSection}` ||
            (currentSection === "home" && href === "#")
        ) {
            link.classList.add("active");
        }

    });
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("load", updateActiveNav);


// ================================
// Mobile Navigation
// ================================

const menuToggle = document.getElementById("menuToggle");
const mobileDropdown = document.getElementById("mobileDropdown");

let scrollPosition = 0;


// ================================
// Open / Close Mobile Navigation
// ================================

if (menuToggle && mobileDropdown) {

    menuToggle.addEventListener("click", () => {

        const isOpen = mobileDropdown.classList.toggle("active");

        if (isOpen) {

            // Save the current scroll position
            scrollPosition = window.scrollY;

            // Lock the page at its current position
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";

        } else {

            // Unlock the page
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";

            // Restore the exact scroll position
            window.scrollTo(0, scrollPosition);

        }

    });


    // ================================
    // Close Menu When Section Selected
    // ================================

    const mobileLinks = mobileDropdown.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            // Close mobile menu
            mobileDropdown.classList.remove("active");

            // Unlock the page
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";

        });

    });

}

// Swiper
const expertiseSwiper = new Swiper("#expertiseCarousel", {

    slidesPerView: 3,
    spaceBetween: 20,

    loop: true,
    speed: 600,
    grabCursor: true,

    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },

    pagination: {
        el: "#expertiseCarousel .carousel-dots",
        clickable: true,
    },


});

const educationBtn = document.querySelector(".education-btn");
const experienceBtn = document.querySelector(".experience-btn");

const educationContent = document.querySelectorAll(".education-item");
const experienceContent = document.querySelector(".work-item");


// =====================================================
// TAB REVEAL
// =====================================================

function resetReveal(element) {
    if (!element) return;

    revealStates.set(element, false);
    element.classList.remove("show");
}


// =====================================================
// SHOW EDUCATION
// =====================================================

function showEducation() {

    // Hide Experience
    experienceContent.style.display = "none";

    // Show Education
    educationContent.forEach((item) => {
        item.style.display = "grid";

        // Reset reveal so animation can play again
        resetReveal(item);
    });

    // Buttons
    educationBtn.classList.add("active");
    experienceBtn.classList.remove("active");

    // Let the browser apply display changes first
    requestAnimationFrame(() => {
        updateReveals();
    });
}


// =====================================================
// SHOW EXPERIENCE
// =====================================================

function showExperience() {

    // Hide Education
    educationContent.forEach((item) => {
        item.style.display = "none";
    });

    // Show Experience
    experienceContent.style.display = "grid";

    // Reset reveal so animation can play again
    resetReveal(experienceContent);

    // Buttons
    experienceBtn.classList.add("active");
    educationBtn.classList.remove("active");

    // Let the browser apply display changes first
    requestAnimationFrame(() => {
        updateReveals();
    });
}


// =====================================================
// DEFAULT
// =====================================================

showEducation();


// =====================================================
// BUTTON EVENTS
// =====================================================

educationBtn.addEventListener("click", showEducation);

experienceBtn.addEventListener("click", showExperience);

const demoButtons = document.querySelectorAll(".demo-btn");
const videoModal = document.getElementById("videoModal");
const closeVideo = document.getElementById("closeVideo");
const demoVideo = document.getElementById("demoVideo");
const videoSource = document.getElementById("videoSource");

demoButtons.forEach((button) => {

    button.addEventListener("click", (e) => {
        e.preventDefault();

        const videoFile = button.dataset.video;

        videoSource.src = videoFile;
        demoVideo.load();

        videoModal.classList.add("show");
        demoVideo.play();
    });

});

closeVideo.addEventListener("click", (e) => {
    e.preventDefault();

    videoModal.classList.remove("show");

    demoVideo.pause();
    demoVideo.currentTime = 0;
    videoSource.src = "";
});

videoModal.addEventListener("click", (e) => {

    if (e.target === videoModal) {
        videoModal.classList.remove("show");

        demoVideo.pause();
        demoVideo.currentTime = 0;
        videoSource.src = "";
    }

});

const pdfLinks = document.querySelectorAll(".open-pdf");
const pdfModal = document.getElementById("pdfModal");
const pdfViewer = document.getElementById("pdfViewer");
const closePdf = document.getElementById("closePdf");

pdfLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const pdfFile = link.dataset.pdf;

        pdfViewer.src = pdfFile;
        pdfModal.classList.add("active");
    });
});

closePdf.addEventListener("click", (e) => {
    e.preventDefault();

    pdfModal.classList.remove("active");
    pdfViewer.src = "";
});

let projectsSwiper = null;

function updateProjects() {

    const projectsContainer = document.querySelector(".projects");
    const projectsWrapper = document.querySelector(".projects-wrapper");
    const projectsDots = document.querySelector(".proj-dots");
    const projectCards = document.querySelectorAll(".project-card");

    if (window.innerWidth <= 768) {

        // =========================
        // MOBILE SWIPER
        // =========================

        if (projectsContainer) {
            projectsContainer.id = "projectsCarousel";
            projectsContainer.className = "carousel swiper reveal-title show";
        }

        if (projectsWrapper) {
            projectsWrapper.className = "swiper-wrapper";
        }

        if (projectsDots) {
            projectsDots.className = "carousel-dots swiper-pagination";
        }

        projectCards.forEach(card => {

            card.classList.add("swiper-slide");

            // Cards do not individually reveal on mobile
            card.classList.remove("reveal-card", "show");

        });


        // Initialize Swiper only once
        if (!projectsSwiper) {

            projectsSwiper = new Swiper("#projectsCarousel", {

                slidesPerView: 3,
                spaceBetween: 20,

                loop: true,
                speed: 600,
                grabCursor: true,

                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },

                pagination: {
                    el: "#projectsCarousel .carousel-dots",
                    clickable: true,
                },

            });
        }


    } else {

        // =========================
        // DESKTOP
        // =========================

        if (projectsSwiper) {
            projectsSwiper.destroy(true, true);
            projectsSwiper = null;
        }


        const projectsCarousel =
            document.querySelector("#projectsCarousel");

        const swiperWrapper =
            document.querySelectorAll(".swiper-wrapper")[1];

        const carouselDots =
            document.querySelectorAll(".carousel-dots")[1];


        if (projectsCarousel) {
            projectsCarousel.removeAttribute("id");
            projectsCarousel.className = "projects";
        }

        if (swiperWrapper) {
            swiperWrapper.className = "projects-wrapper";
        }

        if (carouselDots) {
            carouselDots.className = "proj-dots";
        }


        projectCards.forEach(card => {

            card.classList.remove("swiper-slide");

            // Add reveal animation back
            card.classList.add("reveal-card");

            // Let reveal system decide when to show
            card.classList.remove("show");

        });

    }

    // Re-check reveal elements
    updateReveals();
}

window.addEventListener("resize", updateProjects);

updateProjects();

const animatedElements = document.querySelectorAll(
    '.moving-light, .greetings, .hero-image-outline, .process-circle, .carousel-3d, .code-cursor'
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle(
            'is-paused',
            !entry.isIntersecting
        );
    });
}, {
    threshold: 0
});

animatedElements.forEach((element) => {
    observer.observe(element);
});
