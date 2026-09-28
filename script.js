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
const reveals = document.querySelectorAll(
    ".reveal-right, .reveal-right-tilted1, .reveal-right-tilted2, .reveal-left, .reveal-left-tilted, .reveal-up, .reveal-title, .reveal-headline, .highlight, .reveal-image, .reveal-left-card, .reveal-right-card, .reveal-up-btn, .reveal-down-btn"
);

const headerHeight = window.innerWidth <= 500 ? 49 : 67;

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");

            // Keep highlight shown once activated
            if (entry.target.classList.contains("highlight")) {
                observer.unobserve(entry.target);
            }

        } else {
            entry.target.classList.remove("show");
        }

    });

}, {
    threshold: 0,
    rootMargin: `-${headerHeight}px 0px 0px 0px`
});

reveals.forEach((element) => {
    observer.observe(element);
});

// Navigation Bar
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header nav a, .mobile-dropdown a");

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

if (
    link.getAttribute("href") === `#${currentSection}` ||
    (currentSection === "home" && link.getAttribute("href") === "#")
) {
    link.classList.add("active");
}
    });
}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("load", updateActiveNav);


const menuToggle = document.getElementById("menuToggle");
const mobileDropdown = document.getElementById("mobileDropdown");

menuToggle.addEventListener("click", () => {
    mobileDropdown.classList.toggle("active");
});

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


