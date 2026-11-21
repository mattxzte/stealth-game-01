// Shadow Courier — staged scenes for screenshots.
//
// ?shot=start  the title screen over the first level
// ?shot=play   mid-sneak: the courier slips past a cone toward a cache
// ?shot=alert  a guard has spotted the courier: red cone, meter high
// ?shot=win    the victory screen
//
// Each scene is a real render of the game's own code, frozen in place so a
// headless screenshot catches exactly this frame.

import { TILE } from './config.js';

function tileCenter(tx, ty) {
  return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
}

export function applyShot(game, name) {
  const g0 = game.guards[0];
  const g1 = game.guards[1];
  if (name === 'play') {
    const p = tileCenter(10, 6);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.dir = Math.PI / 2;
    game.player.sneaking = true;
    if (g0) {
      const c = tileCenter(15, 6);
      g0.x = c.x;
      g0.y = c.y;
      g0.dir = Math.PI;
      g0.meter = 22;
    }
    if (g1) {
      const c = tileCenter(2, 3);
      g1.x = c.x;
      g1.y = c.y;
      g1.dir = Math.PI / 2;
    }
    game.mode = 'playing';
    game.frozen = true;
  } else if (name === 'alert') {
    const p = tileCenter(16, 12);
    game.player.x = p.x;
    game.player.y = p.y;
    game.player.dir = -Math.PI / 2;
    game.player.moving = true;
    if (g0) {
      const c = tileCenter(16, 14);
      g0.x = c.x;
      g0.y = c.y;
      g0.dir = -Math.PI / 2;
      g0.state = 'alerted';
      g0.meter = 100;
      g0.lastSeen = { x: p.x, y: p.y };
    }
    game.topMeter = 100;
    game.alerted = true;
    game.mode = 'playing';
    game.frozen = true;
  } else if (name === 'win') {
    game.world.intel.forEach((item) => { item.taken = true; });
    game.exitOpen = true;
    game.score = 3850;
    game.mode = 'victory';
    game.frozen = true;
  } else {
    game.mode = 'title';
    game.frozen = true;
  }
}
