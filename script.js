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



/* =========================
   REVEAL ANIMATION
========================= */

const revealSelector = [
    ".reveal-right",
    ".reveal-right-tilted1",
    ".reveal-right-tilted2",
    ".reveal-left",
    ".reveal-left-tilted",
    ".reveal-up",
    ".reveal-title",
    ".reveal-headline",
    ".highlight",
    ".reveal-image",
    ".reveal-left-card",
    ".reveal-right-card",
    ".reveal-up-btn",
    ".reveal-down-btn",
    ".reveal-card"
].join(", ");

const revealStates = new WeakMap();

let ticking = false;
let revealNavigationFrame = null;


/* =========================
   CONFIGURATION
========================= */

const REVEAL_CONFIG = {
    mobileBreakpoint: 500,

    mobileHeaderHeight: 49,
    desktopHeaderHeight: 67,

    // Reveal elements as they enter the visible screen.
    revealTopOffset: 30,
    revealBottomRatio: 0.95,

    // Hide only after elements leave the viewport.
    hideTopOffset: 20,
    hideBottomOffset: 40
};


/* =========================
   HEADER HEIGHT
========================= */

function getHeaderHeight() {
    return window.innerWidth <= REVEAL_CONFIG.mobileBreakpoint
        ? REVEAL_CONFIG.mobileHeaderHeight
        : REVEAL_CONFIG.desktopHeaderHeight;
}


/* =========================
   CHECK ELEMENT VISIBILITY
========================= */

function isInsideZone(rect, top, bottom) {
    return rect.bottom > top && rect.top < bottom;
}


/* =========================
   UPDATE REVEALS
========================= */

function updateReveals() {
    const reveals = document.querySelectorAll(revealSelector);

    const viewportHeight = window.innerHeight;
    const headerHeight = getHeaderHeight();

    const revealTop =
        headerHeight + REVEAL_CONFIG.revealTopOffset;

    const revealBottom =
        viewportHeight * REVEAL_CONFIG.revealBottomRatio;

    const hideTop =
        headerHeight - REVEAL_CONFIG.hideTopOffset;

    const hideBottom =
        viewportHeight + REVEAL_CONFIG.hideBottomOffset;

    reveals.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isHighlight = element.classList.contains("highlight");

        // Synchronize the stored state with the actual class
        // when the element is first encountered.
        if (!revealStates.has(element)) {
            revealStates.set(
                element,
                element.classList.contains("show")
            );
        }

        const isShown = revealStates.get(element);

        // Highlights reveal once and remain visible.
        if (isHighlight) {
            if (
                !isShown &&
                isInsideZone(rect, revealTop, revealBottom)
            ) {
                element.classList.add("show");
                revealStates.set(element, true);
            }

            return;
        }

        // Reveal elements inside the current reveal zone.
        if (!isShown) {
            if (isInsideZone(rect, revealTop, revealBottom)) {
                element.classList.add("show");
                revealStates.set(element, true);
            }

            return;
        }

        // Hide elements after they leave the viewport.
        const hasLeftAbove = rect.bottom <= hideTop;
        const hasLeftBelow = rect.top >= hideBottom;

        if (hasLeftAbove || hasLeftBelow) {
            element.classList.remove("show");
            revealStates.set(element, false);
        }
    });

    ticking = false;
}


/* =========================
   REQUEST ANIMATION FRAME
========================= */

function requestRevealUpdate() {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(updateReveals);
}


/* =========================
   FORCE IMMEDIATE CHECK
========================= */

function forceRevealCheck() {
    // Cancel any pending scheduled update.
    if (ticking) {
        ticking = false;
    }

    updateReveals();
}


/* =========================
   RECHECK AFTER NAVIGATION
========================= */

function refreshReveals() {
    // Avoid stacking multiple navigation refresh loops.
    if (revealNavigationFrame !== null) {
        cancelAnimationFrame(revealNavigationFrame);
    }

    // Check immediately.
    forceRevealCheck();

    // Check again after the browser updates the scroll position.
    revealNavigationFrame = requestAnimationFrame(() => {
        forceRevealCheck();

        revealNavigationFrame = requestAnimationFrame(() => {
            forceRevealCheck();
            revealNavigationFrame = null;
        });
    });
}


/* =========================
   EVENT LISTENERS
========================= */

// Normal scrolling.
window.addEventListener("scroll", requestRevealUpdate, {
    passive: true
});

// Viewport resizing.
window.addEventListener("resize", requestRevealUpdate, {
    passive: true
});

// Page loading and restoration.
window.addEventListener("load", refreshReveals);
window.addEventListener("pageshow", refreshReveals);


// Recheck after clicking section navigation links.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", refreshReveals);
});


/* =========================
   INITIAL CHECK
========================= */

refreshReveals();





/* ================================
   NAVIGATION BAR
================================ */

const sections = document.querySelectorAll("section, footer");

const navLinks = document.querySelectorAll(
    "header nav a, .mobile-dropdown .mobile-nav-link"
);

const menuToggle = document.getElementById("menuToggle");
const mobileDropdown = document.getElementById("mobileDropdown");

function updateActiveNav() {
    if (!sections.length) return;

    // Do not update navigation while the mobile menu is open.
    if (mobileDropdown?.classList.contains("active")) return;

    const activationPoint = window.innerHeight * 0.4;

    const pageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 5;

    let currentSection = sections[0].id || "home";

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= activationPoint) {
            currentSection = section.id || currentSection;
        }
    });

    // Activate Contact only when the page actually reaches the bottom.
    const footer = document.querySelector("footer#contact");

    if (pageBottom && footer) {
        currentSection = footer.id;
    }

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");

        link.classList.toggle(
            "active",
            href === `#${currentSection}` ||
            (currentSection === "home" && href === "#")
        );
    });
}

window.addEventListener("scroll", updateActiveNav, {
    passive: true
});

window.addEventListener("load", updateActiveNav);
window.addEventListener("resize", updateActiveNav);


/* ================================
   MOBILE NAVIGATION
================================ */

let scrollPosition = 0;


/* ================================
   LOCK PAGE SCROLL
================================ */

function lockPageScroll() {
    scrollPosition = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
}


/* ================================
   UNLOCK PAGE SCROLL
================================ */

function unlockPageScroll(restorePosition = true) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    if (restorePosition) {
        window.scrollTo(0, scrollPosition);
    }
}


/* ================================
   REFRESH PAGE STATE
================================ */

function refreshPageState() {
    requestAnimationFrame(() => {
        updateActiveNav();

        if (typeof refreshReveals === "function") {
            refreshReveals();
        } else if (typeof requestRevealUpdate === "function") {
            requestRevealUpdate();
        }
    });
}


/* ================================
   OPEN / CLOSE MENU
================================ */

if (menuToggle && mobileDropdown) {
    menuToggle.addEventListener("click", () => {
        const isOpening =
            !mobileDropdown.classList.contains("active");

        mobileDropdown.classList.toggle("active", isOpening);

        if (isOpening) {
            lockPageScroll();
        } else {
            unlockPageScroll();
            refreshPageState();
        }
    });

    /* Close menu when a navigation link is selected. */
    const mobileLinks = mobileDropdown.querySelectorAll(
        "a.mobile-nav-link"
    );

    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mobileDropdown.classList.remove("active");

            unlockPageScroll(false);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    refreshPageState();
                });
            });
        });
    });

    /* Close menu using the close button without navigating. */

const closeButtons = mobileDropdown.querySelectorAll("a.close-nav");

closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();

        mobileDropdown.classList.remove("active");

        // Save the current position before unlocking.
        const currentPosition = scrollPosition;

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        // Restore the exact position without smooth scrolling.
        window.scrollTo({
            top: currentPosition,
            left: 0,
            behavior: "instant"
        });

        refreshPageState();
    });
});

}

/* ================================
   SECTION NAVIGATION
================================ */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
        requestAnimationFrame(() => {
            refreshPageState();
        });
    });
});


/* ================================
   PAGE RESTORATION
================================ */

window.addEventListener("pageshow", refreshPageState);



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
