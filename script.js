// Theme toggle with localStorage persistence
(function() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = html.hasAttribute('data-theme');
    setTheme(isDark ? 'light' : 'dark');
  });
})();

// Character-by-character animation for hero title
(function() {
  const heroTitle = document.getElementById('hero-title');
  if (!heroTitle) return;

  // Skip animation if reduced motion preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTitle.style.opacity = '1';
    return;
  }

  const text = heroTitle.textContent;
  heroTitle.innerHTML = '';

  let charIndex = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${0.3 + charIndex * 0.04}s`;
    heroTitle.appendChild(span);
    if (char !== ' ') charIndex++;
  }
})();

// Scroll progress indicator
(function() {
  const scrollProgress = document.getElementById('scroll-progress');
  if (!scrollProgress) return;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
})();

// Custom cursor follower
(function() {
  const cursor = document.getElementById('cursor-follower');
  if (!cursor) return;

  // Disable on touch devices
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    return;
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cursor.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('active');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
  });

  // Hover effect on interactive elements
  const buttons = document.querySelectorAll('.btn');
  const interactiveElements = document.querySelectorAll('a:not(.btn), button, .project, .service, .featured');

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Button hover - lens effect
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      cursor.classList.remove('hover');
      cursor.classList.add('cta-hover');
    });
    btn.addEventListener('mouseleave', () => {
      cursor.classList.remove('cta-hover');
    });
  });
})();

// Scroll reveal with IntersectionObserver
(function() {
  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Section titles with higher threshold
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));
})();


// Hide scroll indicator on scroll
(function() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (!scrollIndicator) return;

  let hasScrolled = false;
  window.addEventListener('scroll', () => {
    if (!hasScrolled && window.scrollY > 100) {
      hasScrolled = true;
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.pointerEvents = 'none';
    }
  }, { passive: true });
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
