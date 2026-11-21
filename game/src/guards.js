// Shadow Courier — guard patrols, vision, suspicion and the chase.
//
// A guard lives in one of four states:
//   patrol     walking its route, cone sweeping ahead
//   suspicious meter crossed the line (or it heard something): it stops,
//              turns toward what it noticed, and walks over to look
//   alerted    meter full: it chases the courier and radios the others
//   return     lost the courier: it walks back to its route and calms down

import {
  TILE, GUARD_RADIUS, GUARD_PATROL_SPEED, GUARD_CHASE_SPEED, GUARD_RETURN_SPEED,
  CONE_RANGE, CONE_HALF_ANGLE, METER_SUSPICIOUS, METER_ALERTED, METER_DECAY,
  METER_CLOSE_RATE, METER_FAR_RATE, SNEAK_DETECTION, SHADOW_DETECTION,
  MOVING_DETECTION, LOSE_SIGHT_SECONDS, CATCH_DISTANCE,
} from './config.js';
import { sfx } from './audio.js';

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function turnToward(cur, target, maxStep) {
  const d = angleDiff(target, cur);
  if (Math.abs(d) <= maxStep) return target;
  return cur + Math.sign(d) * maxStep;
}

export function createGuards(level, world) {
  return level.guards.map((g) => ({
    x: (g.x + 0.5) * TILE,
    y: (g.y + 0.5) * TILE,
    dir: 0,
    route: g.patrol.map(([tx, ty]) => ({ x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE })),
    wp: 1 % g.patrol.length,
    state: 'patrol',
    meter: 0,
    pause: 0,
    look: 0,
    loseTimer: 0,
    investigate: null,
    noiseAt: 0,
    stepAt: 0,
    moved: 0,
  }));
}

function moveToward(guard, tx, ty, speed, dt, world) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  const nx = guard.x + (dx / dist) * step;
  const ny = guard.y + (dy / dist) * step;
  const before = { x: guard.x, y: guard.y };
  world.moveCircle(guard, nx - guard.x, ny - guard.y, GUARD_RADIUS);
  guard.moved += Math.hypot(guard.x - before.x, guard.y - before.y);
  guard.dir = turnToward(guard.dir, Math.atan2(dy, dx), 6 * dt);
  return Math.hypot(tx - guard.x, ty - guard.y) < 4;
}

// How fast this guard's meter fills while it can see the courier.
function detectionRate(guard, player, world) {
  const dist = Math.hypot(player.x - guard.x, player.y - guard.y);
  const t = Math.min(1, dist / CONE_RANGE);
  let rate = METER_CLOSE_RATE + (METER_FAR_RATE - METER_CLOSE_RATE) * t;
  if (player.sneaking) rate *= SNEAK_DETECTION;
  if (world.isShadowPixel(player.x, player.y)) rate *= SHADOW_DETECTION;
  if (player.moving) rate *= MOVING_DETECTION;
  return rate;
}

export function updateGuards(guards, dt, player, world, now, hooks) {
  for (const g of guards) {
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    const dist = Math.hypot(dx, dy);
    const inRange = dist <= CONE_RANGE;
    const inCone = inRange && Math.abs(angleDiff(Math.atan2(dy, dx), g.dir)) <= CONE_HALF_ANGLE;
    const sees = inCone && world.lineOfSight(g.x, g.y, player.x, player.y);

    // Footsteps: louder the closer the guard is to the courier.
    g.moved += 0;
    if (g.moved - g.stepAt > 26) {
      g.stepAt = g.moved;
      const closeness = Math.max(0, 1 - dist / 430);
      if (closeness > 0.05) sfx.footstep(closeness);
    }

    if (sees) {
      g.meter = Math.min(METER_ALERTED, g.meter + detectionRate(g, player, world) * dt);
      g.lastSeen = { x: player.x, y: player.y };
      g.loseTimer = 0;
      if (g.meter >= METER_ALERTED && g.state !== 'alerted') {
        g.state = 'alerted';
        hooks.onAlert(g);
      } else if (g.meter >= METER_SUSPICIOUS && g.state === 'patrol') {
        g.state = 'suspicious';
        g.investigate = { x: player.x, y: player.y };
        hooks.onSuspicious(g);
      }
    } else {
      g.meter = Math.max(0, g.meter - METER_DECAY * dt);
      if (g.state === 'alerted') {
        g.loseTimer += dt;
        if (g.loseTimer > LOSE_SIGHT_SECONDS) {
          g.state = 'return';
          g.meter = METER_SUSPICIOUS;
        }
      }
      if (g.state === 'suspicious' && g.meter < METER_SUSPICIOUS) {
        g.state = 'return';
      }
    }

    // Heard a noise while calm: go and look.
    if (player.noise && g.state === 'patrol' && now - g.noiseAt > 1.2) {
      const nd = Math.hypot(player.noise.x - g.x, player.noise.y - g.y);
      if (nd <= player.noise.radius) {
        g.noiseAt = now;
        g.state = 'suspicious';
        g.investigate = { x: player.noise.x, y: player.noise.y };
        hooks.onSuspicious(g);
      }
    }

    switch (g.state) {
      case 'patrol': {
        if (g.pause > 0) {
          g.pause -= dt;
          const next = g.route[g.wp];
          g.dir = turnToward(g.dir, Math.atan2(next.y - g.y, next.x - g.x), 2.4 * dt);
          break;
        }
        const target = g.route[g.wp];
        if (moveToward(g, target.x, target.y, GUARD_PATROL_SPEED, dt, world)) {
          g.wp = (g.wp + 1) % g.route.length;
          g.pause = 0.45;
        }
        break;
      }
      case 'suspicious': {
        const target = g.investigate || g.lastSeen;
        if (target && !sees) {
          g.dir = turnToward(g.dir, Math.atan2(target.y - g.y, target.x - g.x), 5 * dt);
        }
        if (target && moveToward(g, target.x, target.y, GUARD_PATROL_SPEED * 1.5, dt, world)) {
          if (g.look <= 0) g.look = 1.6;
        }
        if (g.look > 0) {
          g.look -= dt;
          g.dir += 1.8 * dt;
          if (g.look <= 0) g.state = 'return';
        }
        break;
      }
      case 'alerted': {
        const target = g.lastSeen || { x: player.x, y: player.y };
        moveToward(g, target.x, target.y, GUARD_CHASE_SPEED, dt, world);
        if (sees) g.dir = turnToward(g.dir, Math.atan2(dy, dx), 8 * dt);
        if (dist <= CATCH_DISTANCE) hooks.onCaught(g);
        break;
      }
      case 'return': {
        let best = g.route[0];
        let bestD = Infinity;
        for (const p of g.route) {
          const d = Math.hypot(p.x - g.x, p.y - g.y);
          if (d < bestD) { bestD = d; best = p; }
        }
        if (moveToward(g, best.x, best.y, GUARD_RETURN_SPEED, dt, world)) {
          g.wp = g.route.indexOf(best);
          g.state = 'patrol';
          g.pause = 0.3;
        }
        break;
      }
    }
  }
}

// The highest meter among all guards — what the HUD's alert bar shows.
export function maxMeter(guards) {
  let m = 0;
  for (const g of guards) m = Math.max(m, g.meter);
  return m;
}

export function anyAlerted(guards) {
  return guards.some((g) => g.state === 'alerted');
}
