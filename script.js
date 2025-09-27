// Smooth scrolling (your existing)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Active nav link on scroll (your existing)
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


// 🔥 Scroll reveal animations
const revealElements = document.querySelectorAll('.skill-card, .project-card, .education-card, .section-title');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    revealElements.forEach(el => {
        const boxTop = el.getBoundingClientRect().top;
        if (boxTop < triggerBottom) {
            el.classList.add('show');
        } else {
            el.classList.remove('show');
        }
    });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


// 💡 Neon cursor glow
const cursor = document.createElement('div');
cursor.style.position = 'fixed';
cursor.style.width = '20px';
cursor.style.height = '20px';
cursor.style.borderRadius = '50%';
cursor.style.background = 'radial-gradient(circle, rgba(6,214,160,0.8) 0%, transparent 70%)';
cursor.style.pointerEvents = 'none';
cursor.style.zIndex = '9999';
cursor.style.transition = 'transform 0.08s linear';
document.body.appendChild(cursor);

window.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
});


// 🌌 Floating particles in hero
const hero = document.querySelector('.hero-section');
for (let i = 0; i < 20; i++) {
    const particle = document.createElement('span');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    particle.style.width = particle.style.height = Math.random() * 6 + 3 + 'px';
    hero.appendChild(particle);
}


const subtitles = [
    "Computer Engineering Student",
    // "Data Scientist",
    "AI Enthusiast",
    "Web Developer"
];

let index = 0;       // which phrase
let charIndex = 0;   // which character in phrase
let isDeleting = false;
const subtitleElement = document.getElementById("dynamic-subtitle");
const typingSpeed = 100;  // ms per character
const deletingSpeed = 60; // ms per character
const delayBetween = 1500; // pause before deleting

function typeEffect() {
    const currentText = subtitles[index];

    if (isDeleting) {
        subtitleElement.textContent = currentText.substring(0, charIndex--);
    } else {
        subtitleElement.textContent = currentText.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === currentText.length + 1) {
        // pause before deleting
        isDeleting = true;
        setTimeout(typeEffect, delayBetween);
        return;
    }

    if (isDeleting && charIndex === 0) {
        // move to next word
        isDeleting = false;
        index = (index + 1) % subtitles.length;
    }

    const timeout = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(typeEffect, timeout);
}

typeEffect();
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async function(e) {
  e.preventDefault(); // prevent redirect
  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      status.style.display = "block";
      status.style.color = "#0f0";
      status.textContent = "Message sent successfully ✅";
      form.reset();
    } else {
      status.style.display = "block";
      status.style.color = "red";
      status.textContent = "Oops! Something went wrong.";
    }
  } catch (error) {
    status.style.display = "block";
    status.style.color = "red";
    status.textContent = "Error sending message. Try again later.";
  }
});