const palettes = [
  [
    "paper",
    "Warm Paper",
    "#f5efe4",
    "#e3d7c6",
    "#17130e",
    "#766b59",
    "#19c6a2",
  ],
  ["ink", "Ink Proof", "#15130f", "#272218", "#f4ead7", "#c5b798", "#f0df55"],
  [
    "signal",
    "Signal Lab",
    "#eaf5ee",
    "#d6e7df",
    "#102019",
    "#4f6a5d",
    "#00b985",
  ],
  [
    "blueprint",
    "Blueprint",
    "#e9eef2",
    "#d4dde6",
    "#101820",
    "#5a6875",
    "#2d6bff",
  ],
  [
    "citrus",
    "Citrus Note",
    "#f6f0d2",
    "#e7daa8",
    "#17140b",
    "#73683b",
    "#d3a900",
  ],
].map(([id, name, paper, paperShadow, ink, muted, signal]) => ({
  id,
  name,
  paper,
  paperShadow,
  ink,
  muted,
  signal,
}));

const defaults = {
  paletteId: "paper",
  titleScale: 12,
  titleLeading: 0.88,
  roleScale: 1.7,
  frameWidth: 68,
  framePadding: 5,
  shellPadding: 3,
  gridSize: 40,
  texture: 0.14,
  wash: 8,
  markSize: 0.82,
  markShadow: 0.26,
};

const storageKey = "vanity.prototype-controls.v1";

function isPrototypeHost() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("prototype") === "1" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function rgba(hex, alpha) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function readState() {
  try {
    return {
      ...defaults,
      ...JSON.parse(window.localStorage.getItem(storageKey) || "{}"),
    };
  } catch {
    return { ...defaults };
  }
}

let state = readState();

function getPalette() {
  return (
    palettes.find((palette) => palette.id === state.paletteId) || palettes[0]
  );
}

function applyState() {
  const palette = getPalette();
  const root = document.documentElement;

  root.style.setProperty("--paper", palette.paper);
  root.style.setProperty("--paper-shadow", palette.paperShadow);
  root.style.setProperty("--ink", palette.ink);
  root.style.setProperty("--muted", palette.muted);
  root.style.setProperty("--signal", palette.signal);
  root.style.setProperty("--line", rgba(palette.ink, 0.22));
  root.style.setProperty(
    "--proto-wash",
    rgba(palette.signal, state.wash / 100),
  );
  root.style.setProperty("--proto-grid-y", rgba(palette.ink, 0.032));
  root.style.setProperty("--proto-grid-x", rgba(palette.ink, 0.026));
  root.style.setProperty("--proto-grid-size", `${state.gridSize}px`);
  root.style.setProperty("--proto-texture-opacity", String(state.texture));
  root.style.setProperty(
    "--proto-title-size",
    `clamp(3.8rem, 14vw, ${state.titleScale}rem)`,
  );
  root.style.setProperty("--proto-title-leading", String(state.titleLeading));
  root.style.setProperty(
    "--proto-role-size",
    `clamp(0.95rem, 2.5vw, ${state.roleScale}rem)`,
  );
  root.style.setProperty("--proto-frame-width", `${state.frameWidth}rem`);
  root.style.setProperty(
    "--proto-frame-padding",
    `clamp(1.6rem, 7vw, ${state.framePadding}rem)`,
  );
  root.style.setProperty(
    "--proto-shell-padding",
    `clamp(1rem, 4vw, ${state.shellPadding}rem)`,
  );
  root.style.setProperty("--proto-mark-size", `${state.markSize}rem`);
  root.style.setProperty("--proto-mark-shadow", `${state.markShadow}rem`);
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function update(key, value) {
  state = { ...state, [key]: value };
  applyState();
  syncPanel();
}

function reset() {
  state = { ...defaults };
  window.localStorage.removeItem(storageKey);
  applyState();
  syncPanel();
}

function randomize() {
  const palette =
    palettes[Math.floor(Math.random() * palettes.length)] || palettes[0];
  state = {
    paletteId: palette.id,
    titleScale: Number((7.5 + Math.random() * 6).toFixed(1)),
    titleLeading: Number((0.78 + Math.random() * 0.3).toFixed(2)),
    roleScale: Number((1 + Math.random() * 1.2).toFixed(2)),
    frameWidth: Math.round(42 + Math.random() * 56),
    framePadding: Number((1.8 + Math.random() * 6.4).toFixed(1)),
    shellPadding: Number((1 + Math.random() * 5.5).toFixed(1)),
    gridSize: Math.round(12 + Math.random() * 76),
    texture: Number((0.02 + Math.random() * 0.28).toFixed(2)),
    wash: Math.round(Math.random() * 30),
    markSize: Number((0.42 + Math.random() * 1.28).toFixed(2)),
    markShadow: Number((0.08 + Math.random() * 0.58).toFixed(2)),
  };
  applyState();
  syncPanel();
}

function rangeControl({ key, label, min, max, step }) {
  return `
    <label class="prototype-range-row">
      <span>${label}<output data-output="${key}">${state[key]}</output></span>
      <input data-control="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${state[key]}">
    </label>
  `;
}

function renderPanel() {
  const panel = document.createElement("aside");
  panel.className = "prototype-panel";
  panel.setAttribute("aria-label", "Design prototype controls");
  panel.innerHTML = `
    <div class="prototype-head">
      <div>
        <p class="prototype-kicker">Prototype</p>
        <h2 class="prototype-title">Vanity</h2>
      </div>
      <div class="prototype-actions">
        <button type="button" data-action="randomize">Roll</button>
        <button type="button" data-action="reset">Reset</button>
      </div>
    </div>
    <label>
      Palette
      <select data-control="paletteId">
        ${palettes.map((palette) => `<option value="${palette.id}">${palette.name}</option>`).join("")}
      </select>
    </label>
    <div class="prototype-swatches" aria-hidden="true"></div>
    <div class="prototype-ranges">
      ${rangeControl({ key: "titleScale", label: "Title scale", min: 6, max: 14, step: 0.1 })}
      ${rangeControl({ key: "titleLeading", label: "Title leading", min: 0.76, max: 1.12, step: 0.01 })}
      ${rangeControl({ key: "roleScale", label: "Role scale", min: 0.8, max: 2.6, step: 0.01 })}
      ${rangeControl({ key: "frameWidth", label: "Frame width", min: 34, max: 100, step: 1 })}
      ${rangeControl({ key: "framePadding", label: "Frame padding", min: 1.2, max: 9, step: 0.1 })}
      ${rangeControl({ key: "shellPadding", label: "Shell padding", min: 0.8, max: 7, step: 0.1 })}
      ${rangeControl({ key: "gridSize", label: "Grid size", min: 10, max: 96, step: 1 })}
      ${rangeControl({ key: "texture", label: "Texture", min: 0, max: 0.35, step: 0.01 })}
      ${rangeControl({ key: "wash", label: "Color wash", min: 0, max: 30, step: 1 })}
      ${rangeControl({ key: "markSize", label: "Mark size", min: 0.3, max: 2, step: 0.01 })}
      ${rangeControl({ key: "markShadow", label: "Mark shadow", min: 0, max: 0.8, step: 0.01 })}
    </div>
  `;

  panel.addEventListener("input", (event) => {
    const target = event.target;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement
      )
    )
      return;
    const key = target.dataset.control;
    if (!key) return;
    update(key, target.type === "range" ? Number(target.value) : target.value);
  });

  panel.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.dataset.action === "reset") reset();
    if (target.dataset.action === "randomize") randomize();
  });

  document.body.append(panel);
}

function syncPanel() {
  const palette = getPalette();
  document.querySelectorAll("[data-control]").forEach((control) => {
    const key = control.dataset.control;
    if (key) control.value = state[key];
  });
  document.querySelectorAll("[data-output]").forEach((output) => {
    output.textContent = state[output.dataset.output];
  });
  const swatches = document.querySelector(".prototype-swatches");
  if (swatches) {
    swatches.innerHTML = [
      palette.paper,
      palette.paperShadow,
      palette.ink,
      palette.muted,
      palette.signal,
    ]
      .map((color) => `<span style="background:${color}"></span>`)
      .join("");
  }
}

if (isPrototypeHost()) {
  applyState();
  renderPanel();
  syncPanel();
}
