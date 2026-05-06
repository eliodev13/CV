/* ================================================
   PARTICLE CANVAS
   ================================================ */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

const PARTICLE_COUNT = 70;
const MAX_DIST       = 140;
const mouse = { x: null, y: null };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

let particles = [];

class Particle {
  constructor() { this.reset(true); }

  reset(random) {
    this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
    this.y  = random ? Math.random() * H : Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r  = Math.random() * 1.5 + 0.4;
    this.a  = Math.random() * 0.45 + 0.08;
    this.base = { x: this.x, y: this.y };
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) {
        const force = (120 - d) / 120 * 0.4;
        this.x += (dx / d) * force;
        this.y += (dy / d) * force;
      }
    }

    if (this.x < -10)  { this.x = W + 10; }
    if (this.x > W + 10) { this.x = -10; }
    if (this.y < -10)  { this.y = H + 10; }
    if (this.y > H + 10) { this.y = -10; }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,212,255,${this.a})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}
initParticles();

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = dx * dx + dy * dy;
      if (d < MAX_DIST * MAX_DIST) {
        const alpha = 0.06 * (1 - Math.sqrt(d) / MAX_DIST);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

let rafId;
function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  rafId = requestAnimationFrame(animate);
}
animate();

/* ================================================
   NAVBAR — SCROLL EFFECT
   ================================================ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ================================================
   MOBILE NAV TOGGLE
   ================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ================================================
   INTERSECTION OBSERVER — REVEAL + SKILL BARS
   ================================================ */
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    // Animate skill bars inside the revealed card
    entry.target.querySelectorAll('.skill-fill').forEach(fill => {
      const pct = fill.dataset.pct;
      if (pct) {
        requestAnimationFrame(() => {
          fill.style.width = pct + '%';
        });
      }
    });

    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

/* ================================================
   SMOOTH SCROLL OFFSET (for fixed nav)
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ================================================
   ACTIVE NAV LINK ON SCROLL
   ================================================ */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--cyan)' : '';
    });
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
