const VIEW_STORAGE_KEY = 'phaedrus-view';
const fallbackViews = {
  work: {
    kicker: 'Independent systems engineering',
    title: 'Agents, tools, infrastructure.',
    body: 'I build the operating layer around agents: harnesses, review loops, local tools, and prototypes that turn fuzzy ideas into running systems.',
    action: 'Start a thread',
    href: 'mailto:phaedrus.raznikov@pm.me',
    output: '096',
    seed: '3573860127',
    code: '$ phaedrus inspect --work',
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
  setText('view-output', view.output || '096');
  setText('view-seed', view.seed || '3573860127');
  setText('view-code', view.code || '$ phaedrus inspect --work');
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
}

init();
