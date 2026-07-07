(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.createTypewriter = factory().createTypewriter;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function createTypewriter(opts) {
    const textEl = opts.textEl;
    const attrEl = opts.attrEl;
    const pool = opts.pool;
    const pick = opts.pick || null;
    const setTimer = opts.setTimeout || setTimeout;
    const clearTimer = opts.clearTimeout || clearTimeout;
    const random = opts.random || Math.random;

    let timer = null;
    let timerFn = null;
    let paused = false;
    let started = false;
    let last = -1;

    const choose = pick || (() => {
      let i;
      do i = Math.floor(random() * pool.length);
      while (i === last && pool.length > 1);
      last = i;
      return pool[i];
    });

    const later = (fn, ms) => {
      if (paused) return;
      timerFn = fn;
      timer = setTimer(() => {
        timer = null;
        timerFn = null;
        fn();
      }, ms);
    };

    const show = () => {
      const [q, a] = choose();
      const k = Math.max(1, Math.round(q.length / 110));
      let i = 0;
      attrEl.style.opacity = 0;
      const type = () => {
        i += k;
        textEl.textContent = q.slice(0, i);
        if (i < q.length) later(type, 34 + random() * 40);
        else {
          attrEl.textContent = a;
          attrEl.style.opacity = 1;
          later(erase, Math.min(3800 + q.length * 14, 9000));
        }
      };
      const erase = () => {
        attrEl.style.opacity = 0;
        const back = () => {
          i -= 4 * k;
          textEl.textContent = q.slice(0, Math.max(i, 0));
          if (i > 0) later(back, 14);
          else later(show, 650);
        };
        later(back, 350);
      };
      type();
    };

    const start = () => {
      if (started) return;
      started = true;
      show();
    };

    const setPaused = (p) => {
      if (p === paused) return;
      paused = p;
      if (p) {
        if (timer) { clearTimer(timer); timer = null; }
        return;
      }
      if (timerFn) {
        const fn = timerFn;
        timerFn = null;
        fn();
      }
    };

    const isPaused = () => paused;

    return { start, setPaused, isPaused };
  }

  return { createTypewriter };
});
