/* aesthetic recipes — the canonical behavior glue, combined.
   Generated from recipes/*.js by scripts/build-recipes.mjs; edit the
   singles, then `npm run build:recipes`. Each section is
   self-contained — copy what you need, or take this whole file. */

/* the mode: light and dark, defaulting to the system, with a toggle.

   The boot — read the persisted choice before first paint so the page
   never flashes the wrong mode — must be inlined in <head>:

   <script>
     try {
       var m = localStorage.getItem('ae-mode');
       if (m === 'dark' || m === 'light') {
         document.documentElement.classList.add(m);
         document.documentElement.style.colorScheme = m;
       }
     } catch (e) {}
   </script>

   The toggle below pins the opposite of the effective scheme. Pinning
   color-scheme keeps UA widgets (scrollbars, form controls) on the
   pinned side even when the OS disagrees. The change itself is the
   locked choreography: one soft 700ms view-transition breath, a 480ms
   uniform color ease where unsupported, instant under reduced motion.
   next-themes consumers: keep attribute="class" and skip this file —
   the classes match. */
(() => {
  const root = document.documentElement;

  const isDark = () =>
    root.classList.contains('dark')
      ? true
      : root.classList.contains('light')
        ? false
        : matchMedia('(prefers-color-scheme: dark)').matches;

  const reducedMode = matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.ae-mode').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dark = isDark();
      const flip = () => {
        root.classList.toggle('dark', !dark);
        root.classList.toggle('light', dark);
        root.style.colorScheme = dark ? 'light' : 'dark';
        try {
          localStorage.setItem('ae-mode', dark ? 'light' : 'dark');
        } catch (e) {}
      };
      if (reducedMode.matches) {
        flip();
      } else if (document.startViewTransition) {
        root.classList.add('ae-vt-mode');
        document
          .startViewTransition(flip)
          .finished.finally(() => root.classList.remove('ae-vt-mode'));
      } else {
        root.classList.add('ae-mode-easing');
        flip();
        setTimeout(() => root.classList.remove('ae-mode-easing'), 520);
      }
    });
  });
})();

/* the nav indicator: position the sliding ink underline under the
   active item on activation, resize, and font load (metrics shift
   when Geist arrives). Exposes window.aePlaceInds for page scripts
   that swap views and need the indicator re-placed after a display
   change. Works for .ae-nav and .ae-tabs alike. */
(() => {
  const placeInd = (nav) => {
    const active = nav.querySelector(
      '[aria-current], [aria-selected="true"], .is-active',
    );
    const ind = nav.querySelector('.ae-nav-ind');
    if (!active || !ind || !nav.offsetWidth) return;
    ind.style.left = active.offsetLeft + 'px';
    ind.style.width = active.offsetWidth + 'px';
  };
  const placeAllInds = () =>
    document.querySelectorAll('.ae-nav, .ae-tabs').forEach(placeInd);

  document.querySelectorAll('.ae-nav, .ae-tabs').forEach((nav) => {
    nav.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        nav
          .querySelectorAll('a, button')
          .forEach((b) => b.classList.remove('is-active'));
        item.classList.add('is-active');
        placeInd(nav);
      });
    });
  });
  addEventListener('resize', placeAllInds);
  if (document.fonts) document.fonts.ready.then(placeAllInds);
  placeAllInds();

  window.aePlaceInds = placeAllInds;
})();

/* view swap by hash: give each view data-route="name" and link to it
   with href="#name". The matching view mounts (.is-on) and replays
   its entrance; everything else unmounts. Falls back to
   data-route="index" when the hash names nothing. */
(() => {
  const views = document.querySelectorAll('[data-route]');
  if (!views.length) return;
  const show = () => {
    const route = location.hash.slice(1) || 'index';
    let hit = false;
    views.forEach((v) => {
      const on = v.dataset.route === route;
      v.classList.toggle('is-on', on);
      hit = hit || on;
    });
    if (!hit)
      views.forEach((v) =>
        v.classList.toggle('is-on', v.dataset.route === 'index'),
      );
    if (window.aePlaceInds) requestAnimationFrame(window.aePlaceInds);
  };
  addEventListener('hashchange', show);
  show();
})();

/* the send moment: resolve once, persist, and say so. Call
   window.aeSend(button, 'Sent') on success — it flips the costume,
   disables the control (success is never rewound), and announces the
   resolved state to assistive tech: the aria-hidden done layer is
   silent on its own, so a live region speaks for it.

   Forms marked data-ae-demo resolve on submit without a network —
   the site's demo hook; real consumers call aeSend from their own
   submit handling. */
(() => {
  const live = document.createElement('span');
  live.className = 'ae-sr';
  live.setAttribute('role', 'status');
  (document.body || document.documentElement).appendChild(live);

  window.aeSend = (btn, done) => {
    if (!btn || btn.classList.contains('is-sent')) return;
    btn.classList.add('is-sent');
    btn.disabled = true;
    live.textContent = '';
    requestAnimationFrame(() => {
      live.textContent =
        done ||
        btn.dataset.aeDone ||
        (btn.querySelector('.ae-send-done') || {}).textContent ||
        'Done';
    });
  };

  document.querySelectorAll('form[data-ae-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.aeSend(form.querySelector('.ae-send'));
    });
  });
})();

/* settings rows that open: each .ae-setting button toggles the
   .ae-setting-panel that follows it; choosing an option writes the
   row's value and folds the chooser. One row open at a time; Escape
   folds and returns focus. */
(() => {
  const closeSetting = (btn) => {
    const panel = btn.nextElementSibling;
    if (panel) panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  };
  document.querySelectorAll('.ae-setting').forEach((btn) => {
    const panel = btn.nextElementSibling;
    if (!panel || !panel.classList.contains('ae-setting-panel')) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = panel.classList.contains('is-open');
      document.querySelectorAll('.ae-setting').forEach(closeSetting);
      if (!open) {
        panel.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    panel.querySelectorAll('.ae-menu button').forEach((opt) => {
      opt.addEventListener('click', () => {
        panel
          .querySelectorAll('.ae-menu button')
          .forEach((b) => b.classList.toggle('is-sel', b === opt));
        const val = btn.querySelector('.ae-setting-val');
        if (val) val.textContent = opt.dataset.value || opt.textContent.trim();
        closeSetting(btn);
        btn.focus();
      });
    });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSetting(btn);
        btn.focus();
      }
    });
  });
})();

/* input anticipation (the combined warming): the nearest field's
   label and line warm toward ink as the pointer approaches.
   Mouse-only, color-only, capped below the committed state, off under
   reduced motion; focus always snaps to the committed state. Opt in
   with data-ae-anticipate on the form. */
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedAnt = matchMedia('(prefers-reduced-motion: reduce)');
  const forms = document.querySelectorAll('[data-ae-anticipate]');
  if (!forms.length || !fine.matches || reducedAnt.matches) return;

  const fields = [];
  forms.forEach((form) => {
    form.querySelectorAll('.ae-input').forEach((input) => {
      const label = form.querySelector(`label[for="${input.id}"]`);
      fields.push({ input, label, rect: null });
    });
  });
  const measure = () => {
    fields.forEach((f) => {
      f.rect = f.input.getBoundingClientRect();
    });
  };
  let raf = 0;
  let px = 0;
  let py = 0;
  const apply = () => {
    raf = 0;
    let best = null;
    let bestD = Infinity;
    fields.forEach((f) => {
      if (!f.rect) return;
      const dx = Math.max(f.rect.left - px, 0, px - f.rect.right);
      const dy = Math.max(f.rect.top - py, 0, py - f.rect.bottom);
      const d = Math.hypot(dx, dy);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    });
    fields.forEach((f) => {
      const intent =
        f === best ? Math.min(0.6, Math.max(0, 1 - bestD / 180) ** 2) : 0;
      const v = intent ? intent.toFixed(3) : '';
      f.input.style.setProperty('--ae-intent', v);
      if (f.label) f.label.style.setProperty('--ae-intent', v);
    });
  };
  measure();
  addEventListener(
    'pointermove',
    (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    },
    { passive: true },
  );
  addEventListener('resize', measure);
  addEventListener('scroll', measure, { passive: true });
})();

/* the toast: news arrives at the edge and waits to be read.
   window.aeToast('Saved.', { status: 'ok' }) — ok|warn|err puts the
   hue on the glyph, the words stay ink. Toasts persist until
   dismissed or pushed out (the tray keeps four); pass { timeout: ms }
   to opt into self-dismissal — it is never the default. */
(() => {
  const ICONS = {
    ok: '<path d="M20 6 9 17l-5-5"/>',
    warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    err: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };

  let tray = null;
  const ensureTray = () => {
    if (!tray) {
      tray = document.createElement('div');
      tray.className = 'ae-toasts';
      document.body.appendChild(tray);
    }
    return tray;
  };

  const dismiss = (toast) => {
    if (!toast.isConnected) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 200);
  };

  window.aeToast = (message, opts) => {
    const { status, timeout } = opts || {};
    const toast = document.createElement('div');
    toast.className = 'ae-toast';
    toast.setAttribute('role', 'status');
    if (status && ICONS[status]) {
      const i = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      i.setAttribute('class', `ae-icon ae-${status}`);
      i.setAttribute('viewBox', '0 0 24 24');
      i.innerHTML = ICONS[status];
      toast.appendChild(i);
    }
    toast.appendChild(document.createTextNode(message));
    const x = document.createElement('button');
    x.className = 'ae-toast-x';
    x.setAttribute('aria-label', 'dismiss');
    x.textContent = '✕';
    x.addEventListener('click', () => dismiss(toast));
    toast.appendChild(x);

    const t = ensureTray();
    t.appendChild(toast);
    while (t.children.length > 4) t.firstElementChild.remove();
    if (timeout) setTimeout(() => dismiss(toast), timeout);
    return toast;
  };
})();

/* the popover: geometry for the slip. Native [popover] owns the top
   layer, light dismiss, and Escape; this recipe only places the open
   slip by its invoker — below and start-aligned, stepping above or
   inward when the viewport says so.

   <button popovertarget="menu">Options</button>
   <div id="menu" popover class="ae-pop">…</div> */
(() => {
  document.addEventListener(
    'toggle',
    (e) => {
      const pop = e.target;
      if (!(pop instanceof HTMLElement)) return;
      if (!pop.classList.contains('ae-pop')) return;
      if (e.newState !== 'open' || !pop.id) return;
      const inv = document.querySelector(`[popovertarget="${pop.id}"]`);
      if (!inv) return;
      const r = inv.getBoundingClientRect();
      const pr = pop.getBoundingClientRect();
      let top = r.bottom + 6;
      if (top + pr.height > innerHeight - 8) top = r.top - pr.height - 6;
      const left = Math.min(r.left, innerWidth - pr.width - 8);
      pop.style.top = `${Math.max(8, top)}px`;
      pop.style.left = `${Math.max(8, left)}px`;
    },
    true,
  );
})();
