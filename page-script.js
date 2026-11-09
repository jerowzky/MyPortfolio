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


/* ================================
   NAVIGATION BAR (secondary page)
================================ */

const sections = document.querySelectorAll("section[id], footer[id]");

const navLinks = document.querySelectorAll(
    "header nav a, .mobile-dropdown nav a"
);

const menuToggle = document.getElementById("menuToggle");
const mobileDropdown = document.getElementById("mobileDropdown");

let isNavScrolling = false;
let navScrollTimeout;
let pendingRevealHash = null;

// Read the arrival hash ONCE, before anything can rewrite it
const initialHash = window.location.hash;


/* ================================
   HELPERS
================================ */

function normalizePath(pathname) {
    return pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
}

// Returns "#id" only if the href is an anchor on THIS page, otherwise null.
// "index.html#tools" clicked on this page returns null, so it is ignored here.
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

// Links that point to sections on this page
const localLinks = Array.from(navLinks).filter((link) =>
    getSamePageHash(link.getAttribute("href"))
);

// Scrolls without animation, even if CSS has scroll-behavior: smooth
function jumpToElement(target) {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    root.style.scrollBehavior = previous;
}


/* ================================
   MENU STATE
================================ */

function isMobileMenuVisible() {
    return Boolean(mobileDropdown?.classList.contains("active"));
}

function updateMenuAccessibility(isOpen) {
    if (!menuToggle) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
}

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
   SCROLL LOCK
   Pauses the scroll-spy during a programmatic scroll. It releases
   150ms after scrolling stops and does NOT re-run the spy, so the
   section you clicked stays active until you scroll yourself.
================================ */

function endNavLock() {
    isNavScrolling = false;

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
   Only touches links that point to this page. Links to other pages
   (index.html#...) and any manually set "active" class are left alone.
================================ */

function setActiveLink(activeHash) {
    localLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            getSamePageHash(link.getAttribute("href")) === activeHash
        );
    });
}

function updateActiveNav() {
    if (!sections.length || !localLinks.length) return;
    if (isMobileMenuVisible() || isNavScrolling) return;

    const doc = document.documentElement;
    const scrollY = window.scrollY;
    const maxScroll = doc.scrollHeight - window.innerHeight;

    // Page can't really scroll: leave the URL and links alone
    if (maxScroll <= 5) return;

    const footer = document.querySelector("footer#contact");
    const activationPoint = window.innerHeight * 0.4;

    // How far the footer's top must rise into the screen before it counts.
    // Increase for later activation, decrease for earlier.
    const FOOTER_OFFSET = 80;

    let currentSection = null;

    // Regular sections (everything except the footer)
    sections.forEach((section) => {
        if (section === footer) return;

        if (section.getBoundingClientRect().top <= activationPoint) {
            currentSection = section.id;
        }
    });

    // Footer: only when it has actually come into view
    const atBottom = scrollY >= maxScroll - 5;

    const footerReached =
        footer &&
        scrollY > 10 &&
        (footer.getBoundingClientRect().top <= window.innerHeight - FOOTER_OFFSET ||
            atBottom);

    if (footerReached) {
        currentSection = footer.id;
    }

    // Nothing reached yet: clean URL, nothing highlighted
    if (!currentSection) {
        if (window.location.hash) {
            history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search
            );
        }

        setActiveLink(null);
        return;
    }

    const currentHash = `#${currentSection}`;

    if (window.location.hash !== currentHash) {
        history.replaceState(null, "", currentHash);
    }

    setActiveLink(currentHash);
}


/* ================================
   ARRIVING WITH A HASH (this-page.html#section)
   Jump instantly and highlight the target right away, so no other
   section flashes active.
================================ */

function jumpToInitialHash() {
    if (!initialHash || !localLinks.length) return false;

    const target = document.getElementById(
        decodeURIComponent(initialHash.slice(1))
    );

    if (!target) return false;

    startNavLock();
    setActiveLink(initialHash);
    jumpToElement(target);

    return true;
}

// Lock right away so the browser's own jump cannot trigger the spy
// or rewrite the URL before "load"
jumpToInitialHash();


/* ================================
   SCROLL / LOAD LISTENERS
================================ */

window.addEventListener("scroll", () => {

    // Programmatic scroll running: extend the lock until it stops
    if (isNavScrolling) {
        clearTimeout(navScrollTimeout);
        navScrollTimeout = setTimeout(endNavLock, 150);
        return;
    }

    updateActiveNav();

}, { passive: true });

window.addEventListener("load", () => {
    // Jump again in case images/fonts shifted the layout;
    // if there was no (valid) hash, just sync the active link
    if (!jumpToInitialHash()) {
        updateActiveNav();
    }
});

window.addEventListener("resize", updateActiveNav);


/* ================================
   NAVIGATE TO SECTION (this page only)
================================ */

function navigateToSection(hash) {
    const targetId = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(targetId);

    if (!target) {
        console.warn("Navigation target not found:", hash);
        return;
    }

    history.replaceState(null, "", hash);

    setActiveLink(hash);
    startNavLock();

    if (targetId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}


/* ================================
   ALL LINKS (single handler)
   - index.html#tools etc.: not intercepted, the browser navigates
     normally and index.html handles the jump.
   - Anchors on this page: smooth scroll.
================================ */

document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = getSamePageHash(link.getAttribute("href"));
        const inMobileMenu = link.classList.contains("mobile-nav-link");

        // Link to another page: no scroll-spy, no active changes
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

mobileBreakpoint.addEventListener("change", closeMobileMenu);


/* ================================
   PAGE RESTORATION (back/forward cache)
================================ */

window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    // Release any lock left over from before the page was cached
    isNavScrolling = false;
    pendingRevealHash = null;
    clearTimeout(navScrollTimeout);

    closeMobileMenu();
    updateActiveNav();

    if (typeof refreshReveals === "function") {
        refreshReveals();
    }

    if (typeof requestRevealUpdate === "function") {
        requestRevealUpdate();
    }
});



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



/* ================================
   PROJECT GALLERY
================================ */

const galleryTriggers = document.querySelectorAll(".project-images");
const galleryModal = document.getElementById("galleryModal");

// Update image counters
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

if (galleryModal) {
    const galleryImage = galleryModal.querySelector(".gallery-image");
    const galleryTitle = galleryModal.querySelector(".gallery-title");
    const galleryCounter = galleryModal.querySelector(".gallery-counter");
    const closeButton = galleryModal.querySelector(".gallery-close");
    const prevButton = galleryModal.querySelector(".gallery-prev");
    const nextButton = galleryModal.querySelector(".gallery-next");

    let images = [];
    let currentIndex = 0;
    let previousFocus = null;

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;

        galleryImage.src = images[currentIndex];
        galleryImage.alt = `Gallery image ${currentIndex + 1}`;

        galleryCounter.textContent =
            `${currentIndex + 1}\u00A0\u00A0•\u00A0\u00A0${images.length}`;

        const multipleImages = images.length > 1;

        prevButton.hidden = !multipleImages;
        nextButton.hidden = !multipleImages;
    }

    function openGallery(trigger) {
        images = (trigger.dataset.gallery || "")
            .split(",")
            .map(src => src.trim())
            .filter(Boolean);

        if (!images.length) return;

        previousFocus = trigger;

        galleryTitle.textContent =
            trigger.dataset.title || "Project Gallery";

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

    // Open gallery
    document.addEventListener("click", event => {
        const trigger = event.target.closest(".project-images");

        if (trigger) {
            openGallery(trigger);
        }
    });

    // Close gallery
    closeButton.addEventListener("click", closeGallery);

    // Previous image
    prevButton.addEventListener("click", () => {
        showImage(currentIndex - 1);
    });

    // Next image
    nextButton.addEventListener("click", () => {
        showImage(currentIndex + 1);
    });

    // Keyboard controls
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
