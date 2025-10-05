// Animated squares grid background for the hero (with hover highlight)
(() => {
  const config = {
    direction: 'diagonal',     // 'right' | 'left' | 'up' | 'down' | 'diagonal'
    speed: 0.3,                // >= 0.1
    borderColor: '#6d28d9',    // brand purple
    squareSize: 40,
    hoverFillColor: '#4c1d95', // darker purple on hover
    vignetteAlpha: 0.15        // soft edge fade (0..1)
  };

  const canvas = document.getElementById('squares-bg');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let req = null;
  const gridOffset = { x: 0, y: 0 };
  let hoveredSquare = null;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // size the backing store for sharp lines on HiDPI
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    // draw in CSS pixel units
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid();
  }

  function drawGrid() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    const startX = Math.floor(gridOffset.x / config.squareSize) * config.squareSize;
    const startY = Math.floor(gridOffset.y / config.squareSize) * config.squareSize;

    for (let x = startX; x < width + config.squareSize; x += config.squareSize) {
      for (let y = startY; y < height + config.squareSize; y += config.squareSize) {
        const squareX = x - (gridOffset.x % config.squareSize);
        const squareY = y - (gridOffset.y % config.squareSize);

        if (
          hoveredSquare &&
          Math.floor((x - startX) / config.squareSize) === hoveredSquare.x &&
          Math.floor((y - startY) / config.squareSize) === hoveredSquare.y
        ) {
          ctx.fillStyle = config.hoverFillColor;
          ctx.fillRect(squareX, squareY, config.squareSize, config.squareSize);
        }

        ctx.strokeStyle = config.borderColor;
        ctx.strokeRect(squareX, squareY, config.squareSize, config.squareSize);
      }
    }

    if (config.vignetteAlpha > 0) {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.hypot(width, height) / 1.2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${config.vignetteAlpha})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function step() {
    const spd = Math.max(config.speed, 0.1);
    switch (config.direction) {
      case 'right': gridOffset.x = (gridOffset.x - spd + config.squareSize) % config.squareSize; break;
      case 'left':  gridOffset.x = (gridOffset.x + spd + config.squareSize) % config.squareSize; break;
      case 'up':    gridOffset.y = (gridOffset.y + spd + config.squareSize) % config.squareSize; break;
      case 'down':  gridOffset.y = (gridOffset.y - spd + config.squareSize) % config.squareSize; break;
      case 'diagonal':
        gridOffset.x = (gridOffset.x - spd + config.squareSize) % config.squareSize;
        gridOffset.y = (gridOffset.y - spd + config.squareSize) % config.squareSize;
        break;
    }
    drawGrid();
    req = requestAnimationFrame(step);
  }

  function onMouseMove(e) {
    // listen on hero so canvas can keep pointer-events:none
    const rect = hero.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const startX = Math.floor(gridOffset.x / config.squareSize) * config.squareSize;
    const startY = Math.floor(gridOffset.y / config.squareSize) * config.squareSize;

    hoveredSquare = {
      x: Math.floor((mouseX + gridOffset.x - startX) / config.squareSize),
      y: Math.floor((mouseY + gridOffset.y - startY) / config.squareSize)
    };
  }
  function onMouseLeave() { hoveredSquare = null; }

  // Init
  resizeCanvas();
  req = requestAnimationFrame(step);

  // Events
  window.addEventListener('resize', resizeCanvas);
  new ResizeObserver(resizeCanvas).observe(hero);
  hero.addEventListener('mousemove', onMouseMove);
  hero.addEventListener('mouseleave', onMouseLeave);

  // Cleanup (optional)
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(req);
    window.removeEventListener('resize', resizeCanvas);
    hero.removeEventListener('mousemove', onMouseMove);
    hero.removeEventListener('mouseleave', onMouseLeave);
  });
})();
