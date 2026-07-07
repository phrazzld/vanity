const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const { createTypewriter } = require("../colophon");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function makeEl() {
  return { textContent: "", style: { opacity: 0 } };
}

function makeClock() {
  let now = 0;
  let seq = 0;
  let pending = new Map();
  const setTimeout = (fn, ms) => {
    const id = ++seq;
    pending.set(id, { fn, at: now + (ms || 0) });
    return id;
  };
  const clearTimeout = (id) => { pending.delete(id); };
  const tick = (ms) => {
    const end = now + ms;
    while (pending.size) {
      const next = [...pending.values()].sort((a, b) => a.at - b.at)[0];
      if (next.at > end) break;
      now = next.at;
      const id = [...pending.keys()].find((k) => pending.get(k) === next);
      pending.delete(id);
      next.fn();
    }
    now = end;
  };
  const pendingCount = () => pending.size;
  return { setTimeout, clearTimeout, tick, pendingCount };
}

test("createTypewriter types the quote into the text element", () => {
  const textEl = makeEl();
  const attrEl = makeEl();
  const clock = makeClock();
  const tw = createTypewriter({
    textEl,
    attrEl,
    pool: [["hello world", "anon"]],
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => 0,
  });
  tw.start();
  clock.tick(1000);
  assert.equal(textEl.textContent, "hello world");
  assert.equal(attrEl.textContent, "anon");
});

test("pausing freezes the typewriter and clears pending timers", () => {
  const textEl = makeEl();
  const attrEl = makeEl();
  const clock = makeClock();
  const tw = createTypewriter({
    textEl,
    attrEl,
    pool: [["hello world", "anon"]],
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => 0,
  });
  tw.start();
  clock.tick(50);
  const frozen = textEl.textContent;
  assert.ok(frozen.length > 0 && frozen.length < "hello world".length);

  tw.setPaused(true);
  assert.equal(tw.isPaused(), true);
  assert.equal(clock.pendingCount(), 0, "no timer should be pending while paused");

  clock.tick(10000);
  assert.equal(textEl.textContent, frozen, "text must not advance while paused");
});

test("resuming reactivates the typewriter loop", () => {
  const textEl = makeEl();
  const attrEl = makeEl();
  const clock = makeClock();
  const tw = createTypewriter({
    textEl,
    attrEl,
    pool: [["hello world", "anon"]],
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => 0,
  });
  tw.start();
  clock.tick(50);
  const frozen = textEl.textContent;

  tw.setPaused(true);
  clock.tick(10000);
  assert.equal(textEl.textContent, frozen);

  tw.setPaused(false);
  assert.equal(tw.isPaused(), false);
  assert.ok(clock.pendingCount() > 0, "a timer must be scheduled after resume");
  clock.tick(2000);
  assert.equal(textEl.textContent, "hello world");
});

test("pausing during the hold keeps the finished quote on screen", () => {
  const textEl = makeEl();
  const attrEl = makeEl();
  const clock = makeClock();
  const tw = createTypewriter({
    textEl,
    attrEl,
    pool: [["hi", "anon"]],
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => 0,
  });
  tw.start();
  clock.tick(100);
  assert.equal(textEl.textContent, "hi");
  assert.equal(attrEl.textContent, "anon");

  tw.setPaused(true);
  clock.tick(60000);
  assert.equal(textEl.textContent, "hi");
  assert.equal(attrEl.textContent, "anon");
});

test("setPaused is idempotent and resumes only when going true -> false", () => {
  const textEl = makeEl();
  const attrEl = makeEl();
  const clock = makeClock();
  const tw = createTypewriter({
    textEl,
    attrEl,
    pool: [["hello world", "anon"]],
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => 0,
  });
  tw.start();
  clock.tick(50);

  tw.setPaused(false);
  assert.equal(tw.isPaused(), false);
  clock.tick(50);
  assert.ok(clock.pendingCount() > 0);

  tw.setPaused(true);
  tw.setPaused(true);
  assert.equal(tw.isPaused(), true);
  assert.equal(clock.pendingCount(), 0);
});

test("index.html ships a keyboard-reachable pause control wired to the typewriter", () => {
  assert.match(html, /<button[^>]*id="q-toggle"[^>]*aria-pressed="false"/);
  assert.match(html, /<button[^>]*type="button"/);
  assert.match(html, /aria-label="Pause quotes"/);
  assert.match(html, /id="i-pause"/);
  assert.match(html, /id="i-play"/);
  assert.match(html, /src="colophon\.js"/);
  assert.match(html, /createTypewriter\(/);
  assert.match(html, /tw\.setPaused\(p\)/);
  assert.match(html, /\.q-toggle\s*\{/);
  assert.match(html, /prefers-reduced-motion: reduce\)\s*{\s*\.q-toggle\s*\{[^}]*display:\s*none/);
});
