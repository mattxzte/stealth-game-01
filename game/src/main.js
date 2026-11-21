// Shadow Courier — the game loop, the state machine and the score.
//
// Modes: title → playing ⇄ paused, and playing → caught / levelclear →
// victory. A level is won by collecting every intel cache, then reaching the
// exit. Getting caught ends the run on that level; R retries it.

import {
  TILE, VIEW_W, VIEW_H, PLAYER_RADIUS, WALK_SPEED, SNEAK_SPEED,
  SCORE_INTEL, SCORE_LEVEL, SCORE_GHOST, SCORE_SPOTTED,
  TIME_BONUS_MAX, TIME_BONUS_PER_SECOND, INTEL_PICKUP_DISTANCE,
  EXIT_REACH_DISTANCE,
} from './config.js';
import { LEVELS } from './levels.js';
import { buildWorld } from './world.js';
import { createGuards, updateGuards, maxMeter, anyAlerted } from './guards.js';
import { render } from './render.js';
import { initInput, moveVector, isSneaking, onAnyKey } from './input.js';
import { sfx } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  mode: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  world: null,
  guards: [],
  player: { x: 0, y: 0, dir: 0, sneaking: false, moving: false, topMeter: 0, noise: null },
  score: 0,
  levelTime: 0,
  time: 0,
  topMeter: 0,
  alerted: false,
  exitOpen: false,
  spotted: 0,
  clearBonus: 0,
  frozen: false,
  stepAt: 0,
};

function loadLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  game.world = buildWorld(game.level);
  game.guards = createGuards(game.level, game.world);
  game.player.x = game.world.playerStart.x;
  game.player.y = game.world.playerStart.y;
  game.player.dir = 0;
  game.player.sneaking = false;
  game.levelTime = 0;
  game.topMeter = 0;
  game.alerted = false;
  game.exitOpen = false;
  game.spotted = 0;
  game.mode = 'playing';
}

function startGame() {
  game.score = 0;
  loadLevel(0);
}

function onAlert() {
  game.spotted += 1;
  game.score = Math.max(0, game.score - SCORE_SPOTTED);
  sfx.alert();
  // One guard raising the alarm puts the others on edge too.
  for (const g of game.guards) {
    if (g.state === 'patrol') {
      g.state = 'suspicious';
      g.investigate = { x: game.player.x, y: game.player.y };
    }
  }
}

function onCaught() {
  if (game.mode !== 'playing') return;
  game.mode = 'caught';
  sfx.caught();
}

function update(dt) {
  game.time += dt;
  if (game.mode !== 'playing' || game.frozen) return;
  game.levelTime += dt;

  const vec = moveVector();
  const sneaking = isSneaking();
  game.player.sneaking = sneaking;
  game.player.moving = !!vec;
  if (vec) {
    const speed = sneaking ? SNEAK_SPEED : WALK_SPEED;
    game.player.dir = Math.atan2(vec.y, vec.x);
    game.world.moveCircle(game.player, vec.x * speed * dt, vec.y * speed * dt, PLAYER_RADIUS);
    // Noise: walking carries, sneaking barely whispers.
    const now = game.time;
    if (now - game.stepAt > 0.38) {
      game.stepAt = now;
      sfx.playerStep();
    }
    game.player.noise = {
      x: game.player.x,
      y: game.player.y,
      radius: sneaking ? 34 : 104,
    };
  } else {
    game.player.noise = null;
  }

  updateGuards(game.guards, dt, game.player, game.world, game.time, {
    onAlert,
    onSuspicious: () => sfx.suspicious(),
    onCaught,
  });

  game.topMeter = maxMeter(game.guards);
  game.player.topMeter = game.topMeter;
  game.alerted = anyAlerted(game.guards);

  // Pick up intel by walking over it.
  for (const item of game.world.intel) {
    if (item.taken) continue;
    if (Math.hypot(item.x - game.player.x, item.y - game.player.y) <= INTEL_PICKUP_DISTANCE) {
      item.taken = true;
      game.score += SCORE_INTEL;
      sfx.pickup();
      if (game.world.intel.every((i) => i.taken)) {
        game.exitOpen = true;
        sfx.exitOpen();
      }
    }
  }

  // Reach the open exit to clear the level.
  if (game.exitOpen) {
    const e = game.world.exit;
    if (Math.hypot(e.x - game.player.x, e.y - game.player.y) <= EXIT_REACH_DISTANCE) {
      const timeBonus = Math.max(0, TIME_BONUS_MAX - Math.floor(game.levelTime) * TIME_BONUS_PER_SECOND);
      const ghost = game.spotted === 0 ? SCORE_GHOST : 0;
      game.clearBonus = SCORE_LEVEL + timeBonus + ghost;
      game.score += game.clearBonus;
      if (game.levelIndex + 1 < LEVELS.length) {
        game.mode = 'levelclear';
        sfx.levelClear();
      } else {
        game.mode = 'victory';
        sfx.victory();
      }
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render(ctx, game);
  requestAnimationFrame(frame);
}

onAnyKey((code) => {
  sfx.unlock();
  if (code === 'Enter') {
    if (game.mode === 'title') { sfx.click(); startGame(); }
    else if (game.mode === 'levelclear') { sfx.click(); loadLevel(game.levelIndex + 1); }
    else if (game.mode === 'victory' || game.mode === 'caught') { sfx.click(); game.mode = 'title'; }
  } else if (code === 'KeyR') {
    if (game.mode === 'playing' || game.mode === 'caught') { sfx.click(); loadLevel(game.levelIndex); }
  } else if (code === 'KeyP') {
    if (game.mode === 'playing') game.mode = 'paused';
    else if (game.mode === 'paused') game.mode = 'playing';
  } else if (code === 'KeyM') {
    sfx.setMuted(!sfx.isMuted());
  }
});

canvas.addEventListener('click', () => sfx.unlock());

// A small handle for automated play-testing: read the state, or put the
// courier somewhere to check a path. The game itself never calls it.
window.__game = {
  state: () => ({
    mode: game.mode,
    level: game.levelIndex,
    score: game.score,
    intel: game.world.intel.filter((i) => i.taken).length,
    intelTotal: game.world.intel.length,
    exitOpen: game.exitOpen,
    topMeter: game.topMeter,
    alerted: game.alerted,
    spotted: game.spotted,
    player: { x: Math.round(game.player.x), y: Math.round(game.player.y) },
    guards: game.guards.map((g) => ({ x: Math.round(g.x), y: Math.round(g.y), dir: +g.dir.toFixed(2), state: g.state, meter: Math.round(g.meter) })),
  }),
  teleport: (x, y) => { game.player.x = x; game.player.y = y; },
  start: () => startGame(),
  setMode: (m) => { game.mode = m; },
};

initInput();
loadLevel(0);
game.mode = 'title';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(game, shot);

requestAnimationFrame(frame);
