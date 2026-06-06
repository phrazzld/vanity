const VIEW_STORAGE_KEY = 'phaedrus-view';
const fallbackViews = {
  work: {
    kicker: 'Independent systems engineering',
    title: 'Agents, tools, infrastructure.',
    body: 'I build the operating layer around agents: harnesses, review loops, local tools, and prototypes that turn fuzzy ideas into running systems.',
    action: 'Start a thread',
    href: 'mailto:phaedrus.raznikov@pm.me',
    panelLabel: 'Current mode',
    panelTitle: 'Small surface. Real systems.',
    panelItems: [
      'Agent architecture and tool boundaries',
      'Evaluation harnesses and operator review',
      'Prototype paths that can survive cleanup',
    ],
  },
};

let views = fallbackViews;
let defaultView = 'work';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function getViewKey() {
  const requested = new URLSearchParams(window.location.search).get('view');
  const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
  if (requested && views[requested]) return requested;
  if (stored && views[stored]) return stored;
  return defaultView;
}

function renderView(key, { persist = true } = {}) {
  const view = views[key] || views[defaultView] || fallbackViews.work;
  setText('view-kicker', view.kicker);
  setText('hero-title', view.title);
  setText('view-body', view.body);
  setText('view-action', view.action);
  setText('panel-label', view.panelLabel);
  setText('panel-title', view.panelTitle);

  const action = document.getElementById('view-action');
  if (action) action.href = view.href;

  const list = document.getElementById('panel-list');
  if (list) {
    list.replaceChildren(
      ...view.panelItems.map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      })
    );
  }

  document.querySelectorAll('[data-view]').forEach((button) => {
    const isActive = button.dataset.view === key;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (persist) {
    window.localStorage.setItem(VIEW_STORAGE_KEY, key);
  }
}

class Field {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = [];
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
    this.draw();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.points = [];
    const gap = this.width < 680 ? 54 : 72;
    for (let x = -gap; x <= this.width + gap; x += gap) {
      for (let y = -gap; y <= this.height + gap; y += gap) {
        this.points.push({ x, y, phase: Math.random() * Math.PI * 2 });
      }
    }
  }

  draw(time = 0) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'rgba(154, 255, 211, 0.16)';
    this.points.forEach((point) => {
      const pulse = 0.45 + Math.sin(time / 1400 + point.phase) * 0.25;
      this.ctx.globalAlpha = Math.max(0.12, pulse);
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
    requestAnimationFrame(this.draw);
  }
}

async function loadViews() {
  try {
    const response = await fetch('./themes.json');
    const payload = await response.json();
    if (payload?.views) {
      views = payload.views;
      defaultView = payload.defaultView || defaultView;
    }
  } catch {
    views = fallbackViews;
  }
}

async function init() {
  await loadViews();
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => renderView(button.dataset.view));
  });
  renderView(getViewKey(), { persist: false });
  const canvas = document.getElementById('field-canvas');
  if (canvas) new Field(canvas);
}

init();
