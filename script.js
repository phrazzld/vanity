// Scroll progress
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrollTop / docHeight) * 100 + '%';
}, { passive: true });

// Character animation for hero title
const heroTitle = document.getElementById('hero-title');
if (heroTitle) {
  const text = heroTitle.innerHTML;
  heroTitle.innerHTML = '';
  let delay = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '<') {
      const endTag = text.indexOf('>', i);
      const tag = text.substring(i, endTag + 1);
      heroTitle.innerHTML += tag;
      i = endTag;
    } else {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.style.animationDelay = `${0.1 + delay * 0.04}s`;
      heroTitle.appendChild(span);
      if (text[i] !== ' ') delay++;
    }
  }
}

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
