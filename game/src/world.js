// Shadow Courier — the level as a grid: what is solid, what hides you,
// whether one point can see another, and how a circle slides along walls.

import { TILE, COLS, ROWS } from './config.js';

const SOLID = new Set(['#', 'C']);

export function buildWorld(level) {
  const grid = level.map.map((row) => [...row]);
  const solid = grid.map((row) => row.map((c) => SOLID.has(c)));
  const shadow = grid.map((row) => row.map((c) => c === ','));

  let playerStart = { x: TILE * 1.5, y: TILE * 1.5 };
  let exit = { x: TILE * 1.5, y: TILE * 1.5 };
  const intel = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = grid[y][x];
      const cx = (x + 0.5) * TILE;
      const cy = (y + 0.5) * TILE;
      if (c === 'P') playerStart = { x: cx, y: cy };
      if (c === 'E') exit = { x: cx, y: cy, tx: x, ty: y };
      if (c === 'I') intel.push({ x: cx, y: cy, taken: false });
    }
  }

  function tileAtPixel(px, py) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return '#';
    return grid[ty][tx];
  }

  function isSolidTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
    return solid[ty][tx];
  }

  function isSolidPixel(px, py) {
    return isSolidTile(Math.floor(px / TILE), Math.floor(py / TILE));
  }

  function isShadowPixel(px, py) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
    return shadow[ty][tx];
  }

  // True when the straight segment between two points crosses no solid tile.
  // Sampled finely enough that a thin wall can never be jumped over.
  function lineOfSight(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 5));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (isSolidPixel(x1 + dx * t, y1 + dy * t)) return false;
    }
    return true;
  }

  // Does a circle of the given radius fit at (px, py)?
  function circleFits(px, py, r) {
    const x0 = Math.floor((px - r) / TILE);
    const x1 = Math.floor((px + r) / TILE);
    const y0 = Math.floor((py - r) / TILE);
    const y1 = Math.floor((py + r) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!isSolidTile(tx, ty)) continue;
        const nx = Math.max(tx * TILE, Math.min(px, (tx + 1) * TILE));
        const ny = Math.max(ty * TILE, Math.min(py, (ty + 1) * TILE));
        if ((px - nx) * (px - nx) + (py - ny) * (py - ny) < r * r) return false;
      }
    }
    return true;
  }

  // Move a circle by (dx, dy), sliding along walls: try each axis alone.
  function moveCircle(pos, dx, dy, r) {
    if (dx !== 0 && circleFits(pos.x + dx, pos.y, r)) pos.x += dx;
    if (dy !== 0 && circleFits(pos.x, pos.y + dy, r)) pos.y += dy;
  }

  return {
    grid, solid, shadow, playerStart, exit, intel,
    tileAtPixel, isSolidTile, isSolidPixel, isShadowPixel,
    lineOfSight, circleFits, moveCircle,
  };
}
