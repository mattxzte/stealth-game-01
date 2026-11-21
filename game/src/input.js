// Shadow Courier — keyboard state. WASD or arrows to move, Shift to sneak,
// Enter to start or continue, R to restart the level, P to pause, M to mute.

const down = new Set();
let anyKeyHandler = null;

const MOVE_KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) down.add(e.code);
    if (anyKeyHandler) anyKeyHandler(e.code);
  });
  window.addEventListener('keyup', (e) => down.delete(e.code));
  window.addEventListener('blur', () => down.clear());
}

export function onAnyKey(fn) {
  anyKeyHandler = fn;
}

// Normalized movement vector from the keys currently held, or null.
export function moveVector() {
  let x = 0;
  let y = 0;
  for (const code of down) {
    const v = MOVE_KEYS[code];
    if (v) { x += v[0]; y += v[1]; }
  }
  if (x === 0 && y === 0) return null;
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
}

export function isSneaking() {
  return down.has('ShiftLeft') || down.has('ShiftRight');
}

export function isDown(code) {
  return down.has(code);
}
