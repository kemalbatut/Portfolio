// gradual-blur.js
(() => {
  const DEFAULTS = {
    position: 'bottom',   // 'bottom' | 'top' | 'left' | 'right'
    height: '8rem',       // overlay thickness for top/bottom; width for left/right
    divCount: 8,          // number of blur "slices"
    strength: 3,          // base blur multiplier (rem units)
    exponential: true,    // exponential vs linear ramp
    curve: 'linear',      // 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out'
    opacity: 1,           // final overlay opacity
    zIndex: 1000,         // should sit above header (z-50)
    target: 'page'        // 'page' (fixed to viewport) or 'parent' (absolute)
  };

  const CURVES = {
    linear: p => p,
    bezier: p => p * p * (3 - 2 * p),              // smoothstep-ish
    'ease-in': p => p * p,
    'ease-out': p => 1 - Math.pow(1 - p, 2),
    'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
  };

  const dirToCSS = pos => ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
  }[pos] || 'to bottom');

  function createSlices(cfg, container) {
    const inner = document.createElement('div');
    inner.className = 'gradual-blur-inner';

    const increment = 100 / cfg.divCount;
    const curve = CURVES[cfg.curve] || CURVES.linear;

    for (let i = 1; i <= cfg.divCount; i++) {
      // progress (0..1) shaped by curve
      let p = curve(i / cfg.divCount);

      // blur ramp (exponential or linear), scaled in rems
      const blurRem = (cfg.exponential
        ? Math.pow(2, p * 4) * 0.0625   // same shape as your React snippet
        : 0.0625 * (p * cfg.divCount + 1)
      ) * cfg.strength;

      // staggered banded mask to keep it crisp & “stacked”
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const slice = document.createElement('div');
      Object.assign(slice.style, {
        position: 'absolute',
        inset: 0,
        maskImage: `linear-gradient(${dirToCSS(cfg.position)}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${dirToCSS(cfg.position)}, ${gradient})`,
        backdropFilter: `blur(${blurRem.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurRem.toFixed(3)}rem)`,
        opacity: cfg.opacity,
        willChange: 'transform, opacity',
        contain: 'layout style paint'
      });

      inner.appendChild(slice);
    }

    container.appendChild(inner);
    return inner;
  }

  function createOverlay(userCfg = {}) {
    const cfg = Object.assign({}, DEFAULTS, userCfg);

    // wrapper
    const wrap = document.createElement('div');
    wrap.className = 'gradual-blur';

    // layout for chosen side
    if (cfg.position === 'bottom' || cfg.position === 'top') {
      wrap.style.height = cfg.height;
      wrap.style.width = '100%';
      wrap.style[cfg.position] = 0;
      wrap.style.left = 0;
      wrap.style.right = 0;
    } else {
      // left/right
      wrap.style.width = cfg.height;   // treat height as thickness
      wrap.style.height = '100%';
      wrap.style[cfg.position] = 0;
      wrap.style.top = 0;
      wrap.style.bottom = 0;
    }

    wrap.style.zIndex = String(cfg.zIndex);
    wrap.style.opacity = cfg.opacity;

    // If user wants absolute in a specific parent, they can pass an element
    // Otherwise 'page' => fixed to viewport
    if (cfg.target === 'page') {
      wrap.style.position = 'fixed';
    } else {
      wrap.style.position = 'absolute';
    }

    // Build slices
    createSlices(cfg, wrap);

    // Mount
    if (cfg.target === 'page') {
      document.body.appendChild(wrap);
    } else if (cfg.target instanceof Element) {
      cfg.target.style.position ||= 'relative';
      cfg.target.appendChild(wrap);
    } else {
      // fallback: page
      document.body.appendChild(wrap);
    }

    return wrap;
  }

  // Expose a helper for you:
  window.initGradualBlur = (opts) => createOverlay(opts);
})();
