/* the lattice: the page's one generative element, kept from the old
   three-theme site. A quiet node grid; the cursor draws orthogonal
   connections and a dashed crosshair. It is feedback, not decoration —
   nothing moves unprompted. Inks are read from the live custom
   properties at draw time (--ae-line for nodes, --ae-accent for
   connections), so the canvas follows the mode without being told. */
(() => {
  const field = document.querySelector('.lattice-field');
  const canvas = document.getElementById('lattice');
  if (!field || !canvas) return;

  const ctx = canvas.getContext('2d');
  const GRID = 96; /* px between nodes */
  const REACH = 240; /* manhattan radius of cursor connections */
  const NODE_R = 1.75; /* node dot radius */
  const LINE_ALPHA = 0.42; /* connection alpha at zero distance */
  const CROSS_ALPHA = 0.22; /* crosshair alpha */

  let width = 0;
  let height = 0;
  let nodes = [];
  let mouseX = -1e4;
  let mouseY = -1e4;
  let visible = false;
  let raf = null;

  const inks = () => {
    const styles = getComputedStyle(canvas);
    return {
      node: styles.getPropertyValue('--ae-line').trim(),
      accent: styles.getPropertyValue('--ae-accent').trim(),
    };
  };

  const seed = () => {
    nodes = [];
    const cols = Math.ceil(width / GRID) + 1;
    const rows = Math.ceil(height / GRID) + 1;
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        nodes.push({ x: c * GRID, y: r * GRID });
      }
    }
  };

  const resize = () => {
    const rect = field.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    width = rect.width;
    height = rect.height;
    seed();
  };

  const draw = () => {
    if (!visible) {
      raf = null;
      return;
    }

    const ink = inks();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = ink.node;
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = ink.accent;
    ctx.lineWidth = 1;
    nodes.forEach((node) => {
      const manhattan = Math.abs(mouseX - node.x) + Math.abs(mouseY - node.y);
      if (manhattan >= REACH) return;
      ctx.globalAlpha = (1 - manhattan / REACH) * LINE_ALPHA;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(mouseX, node.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    });

    ctx.globalAlpha = CROSS_ALPHA;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(mouseX, 0);
    ctx.lineTo(mouseX, height);
    ctx.moveTo(0, mouseY);
    ctx.lineTo(width, mouseY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(draw);
  };

  new ResizeObserver(resize).observe(field);

  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf) draw();
    },
    { threshold: 0.1 },
  ).observe(field);

  document.addEventListener(
    'mousemove',
    (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => {
    mouseX = -1e4;
    mouseY = -1e4;
  });

  resize();
})();
