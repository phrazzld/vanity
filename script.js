/*
 * Lattice System + Page Interactions
 *
 * Architecture (Ousterhout):
 * - Lattice: deep module, simple interface, all rendering logic encapsulated
 * - Theme: single source of truth via CSS variables
 * - No shallow wrappers or pass-through layers
 */

// ==========================================================================
// Lattice Class - Deep module for reactive grid rendering
// ==========================================================================

class Lattice {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.container = container;

    // Config from CSS variables (single source of truth)
    this.gridSize = 100;
    this.connectionRadius = 250;
    this.nodeRadius = 3;

    // State
    this.nodes = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.isVisible = false;
    this.animationId = null;

    this.init();
  }

  init() {
    this.setupResize();
    this.setupMouse();
    this.setupVisibility();
    this.resize();
  }

  setupResize() {
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this.container);
  }

  setupMouse() {
    // Track mouse relative to canvas position
    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    });
  }

  setupVisibility() {
    // Only animate when visible (performance)
    const observer = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
        if (this.isVisible && !this.animationId) {
          this.draw();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(this.container);
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    this.createNodes();
  }

  createNodes() {
    this.nodes = [];
    const cols = Math.ceil(this.width / this.gridSize) + 1;
    const rows = Math.ceil(this.height / this.gridSize) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.nodes.push({
          x: i * this.gridSize,
          y: j * this.gridSize
        });
      }
    }
  }

  getColors() {
    // Read from CSS variables (respects theme)
    const style = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    return {
      node: isDark ? 'rgba(253, 251, 247, 0.15)' : 'rgba(26, 23, 20, 0.12)',
      line: isDark ? 'rgba(232, 90, 79, 0.7)' : 'rgba(232, 90, 79, 0.5)',
      glow: isDark
    };
  }

  draw() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    const colors = this.getColors();
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw nodes
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = colors.node;
      this.ctx.fill();
    });

    // Draw Manhattan connections to cursor
    this.nodes.forEach(node => {
      const dx = Math.abs(this.mouseX - node.x);
      const dy = Math.abs(this.mouseY - node.y);
      const manhattan = dx + dy;

      if (manhattan < this.connectionRadius) {
        const alpha = 1 - manhattan / this.connectionRadius;
        const lineAlpha = colors.glow ? alpha * 0.8 : alpha * 0.5;

        this.ctx.strokeStyle = `rgba(232, 90, 79, ${lineAlpha})`;
        this.ctx.lineWidth = 1.5;

        // L-shaped path (horizontal then vertical)
        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(this.mouseX, node.y);
        this.ctx.lineTo(this.mouseX, this.mouseY);
        this.ctx.stroke();

        // Glow in dark mode
        if (colors.glow) {
          this.ctx.shadowColor = 'rgba(232, 90, 79, 0.5)';
          this.ctx.shadowBlur = 8;
          this.ctx.stroke();
          this.ctx.shadowBlur = 0;
        }
      }
    });

    // Crosshair
    this.ctx.strokeStyle = colors.line;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseX, 0);
    this.ctx.lineTo(this.mouseX, this.height);
    this.ctx.moveTo(0, this.mouseY);
    this.ctx.lineTo(this.width, this.mouseY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.animationId = requestAnimationFrame(() => this.draw());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ==========================================================================
// Initialize Lattices
// ==========================================================================

const heroCanvas = document.getElementById('hero-lattice');
const heroSection = document.querySelector('.hero');
if (heroCanvas && heroSection) {
  new Lattice(heroCanvas, heroSection);
}

const contactCanvas = document.getElementById('contact-lattice');
const contactSection = document.getElementById('contact');
if (contactCanvas && contactSection) {
  new Lattice(contactCanvas, contactSection);
}

// ==========================================================================
// Theme Toggle
// ==========================================================================

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = 'light';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = 'dark';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = 'light';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// ==========================================================================
// Scroll Progress
// ==========================================================================

const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (scrollTop / docHeight) * 100 + '%';
  }, { passive: true });
}

// ==========================================================================
// Character Animation for Hero Title
// ==========================================================================

const heroTitle = document.getElementById('hero-title');
if (heroTitle) {
  const text = heroTitle.innerHTML;
  let html = '';
  let delay = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '<') {
      // Handle HTML tags (like <em>)
      const endTag = text.indexOf('>', i);
      const tag = text.substring(i, endTag + 1);
      html += tag;
      i = endTag;
    } else {
      const char = text[i] === ' ' ? '&nbsp;' : text[i];
      const delayMs = 0.1 + delay * 0.04;
      html += `<span class="char" style="animation-delay:${delayMs}s">${char}</span>`;
      if (text[i] !== ' ') delay++;
    }
  }

  heroTitle.innerHTML = html;
}

// ==========================================================================
// Reveal on Scroll
// ==========================================================================

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
