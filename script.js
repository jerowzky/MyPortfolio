const enablePointerHover = () => {
    document.addEventListener("pointerover", (event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
            document.documentElement.classList.add("pointer-hover");
        }
    });

    document.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") {
            document.documentElement.classList.remove("pointer-hover");
        } else if (
            event.pointerType === "mouse" ||
            event.pointerType === "pen"
        ) {
            document.documentElement.classList.add("pointer-hover");
        }
    });
};

enablePointerHover();

const aboutSection = document.getElementById("about");
const moveUpBtn = document.getElementById("moveUpBtn");

window.addEventListener("scroll", () => {
    const aboutTop = aboutSection.getBoundingClientRect().top;

    moveUpBtn.classList.toggle("show", aboutTop < window.innerHeight);
}, { passive: true });


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
let revealFrame = null;
let revealNavigationFrame = null;
let pageLoaded = false;
let navRevealTitle = null;


/* =========================
   CONFIGURATION
========================= */

const REVEAL_CONFIG = {
    mobileBreakpoint: 500,
    mobileHeaderHeight: 39,
    desktopHeaderHeight: 67,
    visibilityThreshold: 0.25
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

function isElementVisible(rect, top, bottom) {
    return rect.height > 0 &&
        rect.bottom > top &&
        rect.top < bottom;
}

/* =========================
   UPDATE REVEALS
========================= */

function updateReveals() {
    if (typeof isNavScrolling !== "undefined" && isNavScrolling) {
        ticking = false;
        revealFrame = null;
        return;
    }
    if (!pageLoaded) {
        ticking = false;
        revealFrame = null;
        return;
    }

    const reveals = document.querySelectorAll(revealSelector);
    const viewportHeight = window.innerHeight;
    const visibleTop = getHeaderHeight();
    const updates = [];

    reveals.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isHighlight = element.classList.contains("highlight");
        const isShown = element.classList.contains("show");

        const shouldBeVisible = isElementVisible(
            rect,
            visibleTop,
            viewportHeight
        );

        let shouldShow = isShown;

        if (!isShown && shouldBeVisible) {
            shouldShow = true;
        } else if (
            isShown &&
            !shouldBeVisible &&
            !isHighlight &&
            element !== navRevealTitle
        ) {
            shouldShow = false;
        }

        if (shouldShow !== isShown) {
            updates.push({ element, shouldShow });
        }
    });

    updates.forEach(({ element, shouldShow }) => {
        element.classList.toggle("show", shouldShow);
    });

    ticking = false;
    revealFrame = null;
}
/* =========================
   REQUEST ANIMATION FRAME
========================= */

function requestRevealUpdate() {
    if (!pageLoaded || ticking) return;

    ticking = true;
    revealFrame = requestAnimationFrame(updateReveals);
}


/* =========================
   FORCE IMMEDIATE CHECK
========================= */

function forceRevealCheck() {
    if (!pageLoaded) return;

    if (revealFrame !== null) {
        cancelAnimationFrame(revealFrame);
        revealFrame = null;
    }

    ticking = false;
    updateReveals();
}


/* =========================
   RECHECK AFTER NAVIGATION
========================= */

function refreshReveals() {
    if (!pageLoaded) return;

    if (revealNavigationFrame !== null) {
        cancelAnimationFrame(revealNavigationFrame);
        revealNavigationFrame = null;
    }

    forceRevealCheck();

    revealNavigationFrame = requestAnimationFrame(() => {
        revealNavigationFrame = null;
        forceRevealCheck();

        revealNavigationFrame = requestAnimationFrame(() => {
            revealNavigationFrame = null;
            forceRevealCheck();
        });
    });
}


/* =========================
   INITIALIZE AFTER PAGE LOAD
========================= */

function initializeRevealAnimations() {
    if (pageLoaded) {
        refreshReveals();
        return;
    }

    pageLoaded = true;

    requestAnimationFrame(() => {
        forceRevealCheck();

        requestAnimationFrame(() => {
            forceRevealCheck();
        });
    });
}


/* =========================
   EVENT LISTENERS
========================= */

window.addEventListener("scroll", requestRevealUpdate, {
    passive: true
});

window.addEventListener("resize", requestRevealUpdate, {
    passive: true
});

window.addEventListener("load", initializeRevealAnimations, {
    once: true
});

window.addEventListener("pageshow", initializeRevealAnimations);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", refreshReveals);
});


/* =========================
   INITIAL CHECK
========================= */

if (document.readyState === "complete") {
    initializeRevealAnimations();
}

/* ================================
   NAVIGATION BAR
================================ */

const sections = document.querySelectorAll("section, footer");

const navLinks = document.querySelectorAll(
    "header nav a, .mobile-dropdown nav a"
);

const menuToggle = document.getElementById("menuToggle");
const mobileDropdown = document.getElementById("mobileDropdown");

let isNavScrolling = false;
let navScrollTimeout;
let pendingRevealHash = null;


/* ================================
   PAGE DETECTION
================================ */

// True only on index.html (the page that has the home section).
const isMainPage = Boolean(document.getElementById("home"));

// Read the arrival hash ONCE, before anything can rewrite it
const initialHash = isMainPage ? window.location.hash : "";

function normalizePath(pathname) {
    return pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
}

/*
    Returns "#sectionId" if the href points to a section on the
    CURRENT page. Returns null for everything else, so those links
    navigate normally.
*/
function getSamePageHash(href) {
    if (!href) return null;

    try {
        const url = new URL(href, window.location.href);

        const samePage =
            url.origin === window.location.origin &&
            normalizePath(url.pathname) === normalizePath(window.location.pathname);

        if (!samePage || url.hash.length <= 1) return null;

        return url.hash;
    } catch {
        return null;
    }
}


/* ================================
   MENU STATE
================================ */

function isMobileMenuVisible() {
    return Boolean(mobileDropdown?.classList.contains("active"));
}


/* ================================
   SCROLL LOCK
   Pauses the scroll-spy during a programmatic scroll. It releases
   150ms after scrolling stops and does NOT re-run the spy, so the
   section you clicked stays active until you scroll yourself.
================================ */

function endNavLock() {
    isNavScrolling = false;
    if (typeof updateReveals === "function") updateReveals();

    if (pendingRevealHash) {
        const hash = pendingRevealHash;
        pendingRevealHash = null;

        if (typeof triggerSectionTitleReveal === "function") {
            triggerSectionTitleReveal(hash);
        }
    }
}

function startNavLock() {
    isNavScrolling = true;
    clearTimeout(navScrollTimeout);

    // Fallback in case no scrolling happens (target already in view)
    navScrollTimeout = setTimeout(endNavLock, 400);
}


/* ================================
   ACTIVE NAVIGATION
================================ */

function setActiveLink(activeHash) {
    navLinks.forEach((link) => {
        const href = link.getAttribute("href");

        link.classList.toggle(
            "active",
            getSamePageHash(href) === activeHash ||
            (activeHash === "#home" && href === "#")
        );
    });
}

function updateActiveNav() {
    if (!isMainPage) return;
    if (!sections.length || isMobileMenuVisible()) return;
    if (isNavScrolling) return;

    const activationPoint = window.innerHeight * 0.4;

    const pageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 5;

    let currentSection = sections[0].id || "home";

    sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationPoint) {
            currentSection = section.id || currentSection;
        }
    });

    const footer = document.querySelector("footer#contact");

    if (pageBottom && footer) {
        currentSection = footer.id;
    }

    const currentHash = `#${currentSection}`;

    if (window.location.hash !== currentHash) {
        history.replaceState(null, "", currentHash);
    }

    setActiveLink(currentHash);
}


/* ================================
   SCROLL HELPERS
================================ */

// Scrolls without animation, even if CSS has scroll-behavior: smooth
function jumpToElement(target) {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    root.style.scrollBehavior = previous;
}

// Arriving at index.html#section: jump instantly and highlight the
// target link right away, so no other section flashes active.
function jumpToInitialHash() {
    if (!initialHash) return null;

    const target = document.getElementById(
        decodeURIComponent(initialHash.slice(1))
    );

    if (!target) return null;

    startNavLock();
    setActiveLink(initialHash);
    jumpToElement(target);

    return target;
}


/* ================================
   REPLAY REVEALS AFTER ARRIVING WITH A HASH
   The reveal animation is a CSS transition, so elements must be painted
   hidden first. After the jump we hide the target section's reveal
   elements again, wait a moment, then let the reveal system show them.
================================ */

function replayReveals(target) {
    const root = document.documentElement;

    // Transitions are off (hash-arrival class), so hiding is instant and invisible
    setTimeout(() => {
        if (target) {
            document
                .querySelectorAll(".reveal-card, .reveal-title")
                .forEach((el) => {
                    if (!el.classList.contains("highlight")) {
                        el.classList.remove("show");
                    }
                });
        }

        void document.body.offsetHeight;      // apply the hidden state
        root.classList.remove("hash-arrival"); // transitions back on
        void document.body.offsetHeight;      // apply the transition rules

        // Next frames: let the reveal system show what is in view, animated
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (typeof updateReveals === "function") updateReveals();
            });
        });
    }, 150);
}


/* ================================
   MAIN PAGE LISTENERS
================================ */

if (isMainPage) {

    // Lock right away so the browser's own jump to the hash cannot
    // trigger the scroll-spy or rewrite the URL before "load"
    if (initialHash) startNavLock();

    window.addEventListener("scroll", () => {

        // Programmatic scroll running: extend the lock until it stops
        if (isNavScrolling) {
            clearTimeout(navScrollTimeout);
            navScrollTimeout = setTimeout(endNavLock, 150);
            return;
        }

        updateActiveNav();

    }, { passive: true });

    // Jump now, then again after load in case images/fonts shifted layout
    jumpToInitialHash();

    window.addEventListener("load", () => {
        if (initialHash) {
            const target = jumpToInitialHash();
            replayReveals(target);
        } else {
            document.documentElement.classList.remove("hash-arrival");
            updateActiveNav();
        }
    });

    // Safety: never leave transitions disabled
    setTimeout(() => {
        document.documentElement.classList.remove("hash-arrival");
    }, 3000);

    window.addEventListener("resize", updateActiveNav);
}


/* ================================
   MENU ACCESSIBILITY
================================ */

function updateMenuAccessibility(isOpen) {
    if (!menuToggle) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
}


/* ================================
   OPEN / CLOSE MENU
================================ */

function openMobileMenu() {
    if (!menuToggle || !mobileDropdown || isMobileMenuVisible()) return;

    mobileDropdown.classList.add("active");
    menuToggle.classList.add("active");

    updateMenuAccessibility(true);
}

function closeMobileMenu() {
    if (!mobileDropdown) return;

    mobileDropdown.classList.remove("active");
    menuToggle?.classList.remove("active");

    updateMenuAccessibility(false);
}


/* ================================
   NAVIGATE TO SECTION
================================ */

function navigateToSection(href) {
    if (!href || !href.startsWith("#") || href === "#") return;

    const targetId = decodeURIComponent(href.slice(1));
    const target = document.getElementById(targetId);

    if (!target) {
        console.warn("Navigation target not found:", href);
        return;
    }

    history.replaceState(null, "", href);

    // Highlight the destination immediately and freeze the scroll-spy
    if (isMainPage) setActiveLink(href);
    startNavLock();

    if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}


/* ================================
   ALL SECTION LINKS (single handler)
================================ */

document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = getSamePageHash(link.getAttribute("href"));
        const inMobileMenu = link.classList.contains("mobile-nav-link");

        // Not a section on this page: allow normal browser navigation
        if (!hash) {
            if (inMobileMenu) closeMobileMenu();
            return;
        }

        const target = document.getElementById(
            decodeURIComponent(hash.slice(1))
        );

        if (!target) return;

        event.preventDefault();

        if (!inMobileMenu) {
            navigateToSection(hash);
            return;
        }

        // Mobile: close the menu first, then scroll.
        // The title reveal runs when the scroll settles (see endNavLock).
        closeMobileMenu();

        requestAnimationFrame(() => {
            navigateToSection(hash);
            pendingRevealHash = hash;
        });
    });
});


/* ================================
   MOBILE MENU CONTROLS
================================ */

if (menuToggle && mobileDropdown) {

    menuToggle.addEventListener("click", (event) => {
        event.preventDefault();

        if (isMobileMenuVisible()) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileDropdown.querySelectorAll(".close-nav").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            closeMobileMenu();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMobileMenuVisible()) {
            closeMobileMenu();
        }
    });
}


/* ================================
   RESPONSIVE BREAKPOINT
================================ */

const mobileBreakpoint = window.matchMedia("(max-width: 768px)");

mobileBreakpoint.addEventListener("change", () => {
    closeMobileMenu();
});


/* ================================
   PAGE RESTORATION (back/forward cache)
================================ */

function refreshPageState() {
    // Release any lock left over from before the page was cached
    isNavScrolling = false;
    pendingRevealHash = null;
    clearTimeout(navScrollTimeout);

    updateActiveNav();

    if (typeof refreshReveals === "function") {
        refreshReveals();
    }

    if (typeof requestRevealUpdate === "function") {
        requestRevealUpdate();
    }
}

window.addEventListener("pageshow", (event) => {
    // Only when restored from the back/forward cache.
    // Normal loads are handled by the "load" listener.
    if (event.persisted) {
        refreshPageState();
    }
});


// Swiper
const expertiseSwiper = new Swiper("#skillsCarousel", {

    slidesPerView: 3,
    spaceBetween: 30,

    breakpoints: {
        0: {
            spaceBetween: 20,
        },
        501: {
            spaceBetween: 30,
        },
    },

    loop: true,
    speed: 600,
    grabCursor: true,

    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        stopOnLastSlide: false,
        waitForTransition: true,
    },

    pagination: {
        el: "#skillsCarousel .carousel-dots",
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
const videoTitle = document.querySelector(".video-title");
const videoLabel = document.querySelector(".video-label");

// Open video modal
demoButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();

        const videoFile = button.dataset.video;
        const title = button.dataset.title;
        const label = button.dataset.label;

        videoTitle.textContent = title || "";
        videoLabel.textContent = label || "";

        videoSource.src = videoFile;
        demoVideo.load();

        videoModal.classList.add("show");
        demoVideo.play();
    });
});

// Function to close video modal
function closeVideoModal() {
    videoModal.classList.remove("show");

    demoVideo.pause();
    demoVideo.currentTime = 0;
    videoSource.src = "";
    demoVideo.load();
}

// Close only when the close button is clicked
closeVideo.addEventListener("click", (e) => {
    e.preventDefault();
    closeVideoModal();
});

// Close when Escape key is pressed
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal.classList.contains("show")) {
        closeVideoModal();
    }
});


const pdfLinks = document.querySelectorAll(".open-pdf");
const pdfModal = document.getElementById("pdfModal");
const pdfViewer = document.getElementById("pdfViewer");
const closePdf = document.getElementById("closePdf");
const pdfTitle = document.querySelector(".pdf-title");
const pdfLabel = document.querySelector(".pdf-label");
const downloadPdf = document.getElementById("downloadPdf");

// Local PDF.js viewer
const pdfJsViewer = new URL(
    "pdfjs/web/viewer.html",
    document.baseURI
).href;

// Open PDF modal
pdfLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const pdfFile = link.dataset.pdf;
        const title = link.dataset.title;
        const label = link.dataset.label;

        if (!pdfFile) {
            console.error("PDF file path is missing.");
            return;
        }

        // Resolve the PDF path
        const pdfUrl = new URL(
            pdfFile,
            document.baseURI
        ).href;

        // Update modal title and label
        if (pdfTitle) {
            pdfTitle.textContent = title || "";
        }

        if (pdfLabel) {
            pdfLabel.textContent = label || "";
        }

        // Show download button only for resume.pdf
        if (downloadPdf) {
            const filename = new URL(pdfUrl).pathname
                .split("/")
                .pop();

            if (filename.toLowerCase() === "fornal_resume.pdf") {
                downloadPdf.href = pdfUrl;
                downloadPdf.style.display = "flex";
                downloadPdf.setAttribute("download", "Fornal_Resume.pdf");
            } else {
                downloadPdf.style.display = "none";
                downloadPdf.removeAttribute("href");
            }
        }

        // Build the local PDF.js viewer URL
        const viewerUrl = new URL(pdfJsViewer);
        viewerUrl.searchParams.set("file", pdfUrl);

        // Show the modal
        pdfModal.classList.add("active");

        // Load the PDF
        pdfViewer.src = viewerUrl.href;

        // Debugging information
        console.log("PDF file URL:", pdfUrl);
        console.log("PDF.js viewer URL:", pdfViewer.src);
    });
});

// Close PDF modal
function closePdfModal() {
    pdfModal.classList.remove("active");

    // Stop the viewer when closing
    pdfViewer.src = "about:blank";
}

// Close using the X button
if (closePdf) {
    closePdf.addEventListener("click", (e) => {
        e.preventDefault();
        closePdfModal();
    });
}

// Close using the Escape key
document.addEventListener("keydown", (e) => {
    if (
        e.key === "Escape" &&
        pdfModal.classList.contains("active")
    ) {
        closePdfModal();
    }
});

let projectsSwiper = null;
let lastIsMobile = null;

// Grab the elements once, before their classes get swapped around.
// (Looking them up by class every time breaks after the first switch,
// because the classes change between mobile and desktop.)
const projectsContainer = document.querySelector(".projects");
const projectsWrapper = projectsContainer?.querySelector(".projects-wrapper");
const projectsDots = projectsContainer?.querySelector(".proj-dots");
const projectCards = Array.from(document.querySelectorAll(".project-card"));

function updateProjects() {
    if (!projectsContainer) return;

    const isMobile = window.innerWidth <= 768;

    // Only rebuild when the breakpoint actually changes. Without this,
    // every resize (including the mobile address bar hiding) wipes the
    // reveal state and the cards flash or replay.
    if (isMobile === lastIsMobile) return;
    lastIsMobile = isMobile;

    if (isMobile) {

        // =========================
        // MOBILE SWIPER
        // =========================

        projectsContainer.id = "projectsCarousel";
        projectsContainer.classList.remove("projects");
        projectsContainer.classList.add("carousel", "swiper", "reveal-title");
        // No forced "show": the reveal system decides when it appears

        if (projectsWrapper) {
            projectsWrapper.classList.remove("projects-wrapper");
            projectsWrapper.classList.add("swiper-wrapper");
        }

        if (projectsDots) {
            projectsDots.classList.remove("proj-dots");
            projectsDots.classList.add("carousel-dots", "swiper-pagination");
        }

        projectCards.forEach((card) => {
            card.classList.add("swiper-slide");

            // Cards do not individually reveal on mobile
            card.classList.remove("reveal-card", "show");
        });

        // Initialize Swiper only once
        if (!projectsSwiper && typeof Swiper !== "undefined") {
            projectsSwiper = new Swiper("#projectsCarousel", {
                slidesPerView: 3,
                spaceBetween: 30,

                breakpoints: {
                    0: { spaceBetween: 20 },
                    501: { spaceBetween: 30 },
                },

                loop: true,
                speed: 600,
                grabCursor: true,

                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                    stopOnLastSlide: false,
                    waitForTransition: true,
                },

                pagination: {
                    el: "#projectsCarousel .carousel-dots",
                    clickable: true,
                },

                on: {
                    init: function () {
                        this.slides.forEach((slide) => slide.removeAttribute("role"));
                    },

                    slideChange: function () {
                        this.slides.forEach((slide) => slide.removeAttribute("role"));
                    },
                },
            });

            projectsSwiper.slides.forEach((slide) => slide.removeAttribute("role"));
        }

    } else {

        // =========================
        // DESKTOP
        // =========================

        if (projectsSwiper) {
            projectsSwiper.destroy(true, true);
            projectsSwiper = null;
        }

        projectsContainer.removeAttribute("id");
        projectsContainer.classList.remove("carousel", "swiper", "reveal-title", "show");
        projectsContainer.classList.add("projects");

        if (projectsWrapper) {
            projectsWrapper.classList.remove("swiper-wrapper");
            projectsWrapper.classList.add("projects-wrapper");
        }

        if (projectsDots) {
            projectsDots.classList.remove("carousel-dots", "swiper-pagination");
            projectsDots.classList.add("proj-dots");
        }

        projectCards.forEach((card) => {
            card.classList.remove("swiper-slide");

            // Add reveal animation back
            card.classList.add("reveal-card");

            // Let the reveal system decide when to show
            card.classList.remove("show");
        });
    }

    // Re-check reveal elements
    if (typeof updateReveals === "function") {
        updateReveals();
    }
}

window.addEventListener("resize", updateProjects);

updateProjects();

const animatedElements = document.querySelectorAll(
    '.moving-light, .greetings, .floating-gallery__ring, .diagonal-marquee-column'
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

const galleryTriggers = document.querySelectorAll(".gallery-trigger");

galleryTriggers.forEach(trigger => {
    const images = (trigger.dataset.gallery || "")
        .split(",")
        .map(src => src.trim())
        .filter(Boolean);

    const imageCounter = trigger.querySelector(".image-counter");

    if (imageCounter) {
        imageCounter.textContent = `+${Math.max(0, images.length - 1)}`;
    }
});
const galleryModal = document.getElementById("galleryModal");

if (galleryModal) {
    const galleryImage = galleryModal.querySelector(".gallery-image");
    const galleryTitle = galleryModal.querySelector(".gallery-title");
    const galleryCounter = galleryModal.querySelector(".gallery-counter");
    const closeButton = galleryModal.querySelector(".gallery-close");
    const prevButton = galleryModal.querySelector(".gallery-prev");
    const nextButton = galleryModal.querySelector(".gallery-next");
    const imageCounter = document.getElementById("image-counter");
    let currentIndex = 0;
    let previousFocus = null;

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;

        galleryImage.src = images[currentIndex];
        galleryImage.alt = `Gallery image ${currentIndex + 1}`;
        galleryCounter.textContent =
            `${currentIndex + 1}\u00A0\u00A0•\u00A0\u00A0${images.length}`;

        // Hide arrows when there's only one image
        const multipleImages = images.length > 1;
        prevButton.hidden = !multipleImages;
        nextButton.hidden = !multipleImages;
    }

    function openGallery(trigger) {
        images = trigger.dataset.gallery
            .split(",")
            .map(src => src.trim())
            .filter(Boolean);

        if (!images.length) return;
        
        previousFocus = trigger;
        galleryTitle.textContent = trigger.dataset.title || "Project Gallery"; 
        showImage(0);

        galleryModal.classList.add("active");
        galleryModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");

        closeButton.focus();
    }

    function closeGallery() {
    galleryModal.classList.remove("active");
    galleryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");

        galleryImage.removeAttribute("src");

        if (previousFocus?.isConnected) {
            previousFocus.focus();
        }
    }

    // Event delegation: works for every current or future trigger
    document.addEventListener("click", event => {
        const trigger = event.target.closest(".gallery-trigger");

        if (trigger) {
            openGallery(trigger);
        }
    });

    closeButton.addEventListener("click", closeGallery);

    prevButton.addEventListener("click", () => {
        showImage(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        showImage(currentIndex + 1);
    });


    document.addEventListener("keydown", event => {
        if (!galleryModal.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeGallery();
        } else if (event.key === "ArrowRight" && images.length > 1) {
            showImage(currentIndex + 1);
        } else if (event.key === "ArrowLeft" && images.length > 1) {
            showImage(currentIndex - 1);
        }
    });
}


const marqueeColumns = document.querySelectorAll(".diagonal-marquee-column");

function updateMarqueeDistances() {
    marqueeColumns.forEach(column => {
        const groups = column.querySelectorAll(".marquee-group");

        if (groups.length < 2) return;

        const firstGroup = groups[0];
        const distance = firstGroup.getBoundingClientRect().width + 18;

        column.style.setProperty("--marquee-distance", `${distance}px`);
    });
}

window.addEventListener("load", updateMarqueeDistances);
window.addEventListener("resize", updateMarqueeDistances);

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("contribution-grid");
  const monthLabels = document.getElementById("month-labels");
  const totalElement = document.getElementById("contribution-total");
  const periodElement = document.getElementById("contribution-period");
  const statusElement = document.getElementById("contribution-status");
  const tooltip = document.getElementById("contribution-tooltip");

  if (!grid || !monthLabels || !totalElement) return;

  const DAY_MS = 86400000;
  const MIN_COLUMN_WIDTH = 12;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });

  const parseDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`Invalid date format: ${value}`);
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error(`Invalid calendar date: ${value}`);
    }

    return date;
  };

  const toDateString = (date) => date.toISOString().slice(0, 10);

  const showTooltip = (cell, event) => {
    if (!tooltip || !cell.dataset.tooltip) return;

    tooltip.textContent = cell.dataset.tooltip;
    tooltip.classList.add("visible");

    const rect = cell.getBoundingClientRect();
    const x = event?.clientX ?? rect.left + rect.width / 2;
    const y = event?.clientY ?? rect.top;

    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    tooltip.style.left = `${Math.max(
      8,
      Math.min(x + 12, window.innerWidth - tooltipWidth - 8)
    )}px`;

    tooltip.style.top = `${Math.max(
      8,
      y - tooltipHeight - 10
    )}px`;
  };

  const hideTooltip = () => {
    tooltip?.classList.remove("visible");
  };

  window.addEventListener("scroll", () => {
  hideTooltip();

  if (tooltip) {
    tooltip.dataset.activeDate = "";
  }
}, { passive: true });

  try {
    const response = await fetch("./contributions.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Could not load contributions.json (${response.status})`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.contributions)) {
      throw new Error("The contributions array is missing.");
    }

    if (!data.from || !data.to) {
      throw new Error("The contribution date range is missing.");
    }

    const firstDate = parseDate(data.from);
    const lastDate = parseDate(data.to);

    if (firstDate > lastDate) {
      throw new Error("The contribution date range is invalid.");
    }

    const dailyData = new Map();

    for (const day of data.contributions) {
      if (
        !day ||
        typeof day.date !== "string" ||
        !Number.isFinite(Number(day.count))
      ) {
        continue;
      }

      dailyData.set(day.date, day);
    }

    // Extend the calendar to complete Sunday-to-Saturday weeks.
    const calendarStart = new Date(firstDate);
    calendarStart.setUTCDate(
      calendarStart.getUTCDate() - calendarStart.getUTCDay()
    );

    const calendarEnd = new Date(lastDate);
    calendarEnd.setUTCDate(
      calendarEnd.getUTCDate() + (6 - calendarEnd.getUTCDay())
    );

    const dayCount =
      Math.round((calendarEnd - calendarStart) / DAY_MS) + 1;

    const weekCount = dayCount / 7;

    if (!Number.isInteger(weekCount) || weekCount <= 0) {
      throw new Error("Could not calculate the contribution calendar.");
    }

    grid.replaceChildren();
    monthLabels.replaceChildren();

    // Use the same column template for both grids.
    const columnTemplate =
      `repeat(${weekCount}, minmax(${MIN_COLUMN_WIDTH}px, 1fr))`;

    grid.style.display = "grid";
    grid.style.gridTemplateColumns = columnTemplate;
    grid.style.gridTemplateRows = "repeat(7, auto)";
    grid.style.gridAutoFlow = "row";
    grid.style.width = "100%";
    grid.style.boxSizing = "border-box";

    monthLabels.style.display = "grid";
    monthLabels.style.gridTemplateColumns = columnTemplate;
    monthLabels.style.gridAutoFlow = "row";
    monthLabels.style.width = "100%";
    monthLabels.style.boxSizing = "border-box";

    // Match the horizontal gap and minimum width.
    const gridStyles = getComputedStyle(grid);
    const columnGap = parseFloat(gridStyles.columnGap) || 0;

    const minimumWidth =
      weekCount * MIN_COLUMN_WIDTH +
      (weekCount - 1) * columnGap;

    grid.style.minWidth = `${minimumWidth}px`;
    monthLabels.style.minWidth = `${minimumWidth}px`;
    monthLabels.style.columnGap = gridStyles.columnGap;

    totalElement.textContent =
      `${Number(data.total ?? 0).toLocaleString()} contributions`;grid.setAttribute("role", "img");
    grid.setAttribute(
    "aria-label",
    `${Number(data.total ?? 0).toLocaleString()} contributions from ${formatDate(firstDate)} to ${formatDate(lastDate)}`
    );

    if (periodElement) {
      periodElement.textContent =
        `from ${formatDate(firstDate)} to ${formatDate(lastDate)}`;
    }

    // Render each week as one column.
    for (let week = 0; week < weekCount; week++) {
      const weekStart = new Date(calendarStart);
      weekStart.setUTCDate(calendarStart.getUTCDate() + week * 7);

      const weekDates = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setUTCDate(weekStart.getUTCDate() + dayOffset);
        weekDates.push(date);

        const dateString = toDateString(date);
        const day = dailyData.get(dateString);

        const cell = document.createElement("div");
        cell.className = "contribution-day";
        cell.dataset.date = dateString;
        cell.style.gridColumn = String(week + 1);
        cell.style.gridRow = String(dayOffset + 1);

        if (date < firstDate || date > lastDate) {
          cell.classList.add("empty-day");
          cell.setAttribute("aria-hidden", "true");
        } else {
          const count = Number(day?.count ?? 0);
          const rawLevel = Number(day?.level ?? 0);
          const level = Math.max(0, Math.min(4, rawLevel));

          cell.classList.add(`level-${level}`);

          cell.dataset.tooltip =
            `${count} contribution${count === 1 ? "" : "s"} on ${formatDate(date)}`;

          cell.setAttribute("role", "img");
          cell.setAttribute("aria-label", cell.dataset.tooltip);

          if (day?.color) {
            cell.style.backgroundColor = day.color;
          }

          if (tooltip) {
            cell.addEventListener("mouseenter", (event) => {
              showTooltip(cell, event);
            });

            cell.addEventListener("mousemove", (event) => {
              showTooltip(cell, event);
            });

            cell.addEventListener("mouseleave", hideTooltip);

            cell.addEventListener("click", (event) => {
            event.stopPropagation();

            if (
                tooltip.classList.contains("visible") &&
                tooltip.dataset.activeDate === cell.dataset.date
            ) {
                hideTooltip();
                tooltip.dataset.activeDate = "";
            } else {
                tooltip.dataset.activeDate = cell.dataset.date;
                showTooltip(cell);
            }
            });
          }
        }

        grid.appendChild(cell);
      }

      // Find the first day of each month in this week.
      const monthStarts = weekDates.filter(
        (date) =>
          date.getUTCDate() === 1 &&
          date >= firstDate &&
          date <= lastDate
      );

      // Label the first visible week when the range starts mid-month.
      if (week === 0 && monthStarts.length === 0) {
        monthStarts.push(firstDate);
      }

      monthStarts.forEach((date, index) => {
        const label = document.createElement("span");

        label.className = "month-label";
        label.textContent = date.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC"
        });

        label.style.gridColumn = String(week + 1);
        label.style.gridRow = "1";
        label.style.justifySelf = "start";
        label.style.whiteSpace = "nowrap";
        label.style.position = "relative";

        // Avoid two labels starting at the same position in one week.
        if (index > 0) {
          label.style.marginLeft = "12px";
        }

        monthLabels.appendChild(label);
      });
    }

    if (statusElement) {
      statusElement.textContent = "Daily contribution activity";
    }
  } catch (error) {
    console.error("Contribution graph error:", error);

    totalElement.textContent = "Unable to load";

    if (periodElement) {
      periodElement.textContent = "";
    }

    if (statusElement) {
      statusElement.textContent =
        "Could not load contributions. Check contributions.json and the browser console.";
    }
  }
});



