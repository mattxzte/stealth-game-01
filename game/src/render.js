// Shadow Courier — everything the player sees, drawn on one canvas.
// The level reads at a glance: pale cones are safe to cross, orange means a
// guard is getting curious, red means run. Cover is dark and boxy, the exit
// glows green once it is open.

import { TILE, COLS, ROWS, VIEW_W, VIEW_H, CONE_RANGE, CONE_HALF_ANGLE, PALETTE } from './config.js';

function drawFloor(ctx, world, time) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const c = world.grid[y][x];
      if (c === '#') {
        ctx.fillStyle = PALETTE.wall;
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = PALETTE.wallTop;
        ctx.fillRect(px, py, TILE, 5);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(px, py + TILE - 4, TILE, 4);
      } else if (c === 'C') {
        ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = PALETTE.crate;
        ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
        ctx.strokeStyle = PALETTE.crateEdge;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
        ctx.beginPath();
        ctx.moveTo(px + 4, py + 4);
        ctx.lineTo(px + TILE - 4, py + TILE - 4);
        ctx.moveTo(px + TILE - 4, py + 4);
        ctx.lineTo(px + 4, py + TILE - 4);
        ctx.stroke();
      } else {
        ctx.fillStyle = world.shadow[y][x]
          ? PALETTE.shadowFloor
          : ((x + y) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB);
        ctx.fillRect(px, py, TILE, TILE);
        if (world.shadow[y][x]) {
          ctx.strokeStyle = 'rgba(120, 140, 220, 0.10)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 6, py + TILE - 6);
          ctx.lineTo(px + TILE - 6, py + 6);
          ctx.stroke();
        }
      }
    }
  }
}

function drawCone(ctx, g) {
  const color = g.state === 'alerted'
    ? PALETTE.coneAlerted
    : g.state === 'suspicious' ? PALETTE.coneSuspicious : PALETTE.coneCalm;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.arc(g.x, g.y, CONE_RANGE, g.dir - CONE_HALF_ANGLE, g.dir + CONE_HALF_ANGLE);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.35)');
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawIntel(ctx, item, time) {
  const pulse = 0.6 + 0.4 * Math.sin(time * 3 + item.x);
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = PALETTE.intel;
  ctx.globalAlpha = 0.25 + 0.35 * pulse;
  ctx.fillRect(-11, -11, 22, 22);
  ctx.globalAlpha = 1;
  ctx.fillRect(-6, -6, 12, 12);
  ctx.fillStyle = '#0b2b28';
  ctx.fillRect(-2.5, -2.5, 5, 5);
  ctx.restore();
}

function drawExit(ctx, exit, open, time) {
  const glow = open ? 0.5 + 0.3 * Math.sin(time * 4) : 0.25;
  ctx.save();
  ctx.translate(exit.x, exit.y);
  ctx.fillStyle = open ? PALETTE.exitOpen : PALETTE.exitLocked;
  ctx.globalAlpha = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillRect(-13, -16, 26, 32);
  ctx.fillStyle = '#0e1a12';
  ctx.fillRect(-7, -10, 14, 20);
  if (open) {
    ctx.fillStyle = '#eafff0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', 0, -26);
  }
  ctx.restore();
}

function drawGuard(ctx, g) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 13, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c1f14';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.rotate(g.dir);
  ctx.fillStyle = '#ffd9d2';
  ctx.beginPath();
  ctx.arc(7, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (g.state === 'suspicious' || g.state === 'alerted') {
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = g.state === 'alerted' ? '#ff5a4a' : '#ffb347';
    ctx.fillText(g.state === 'alerted' ? '!' : '?', g.x, g.y - 18);
  }
}

function drawPlayer(ctx, p, time) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(0, 0, p.sneaking ? 10 : 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0e5b50';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.rotate(p.dir);
  ctx.fillStyle = '#eafffa';
  ctx.beginPath();
  ctx.arc(6, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Detection ring: how close any guard is to spotting you.
  if (p.topMeter > 2) {
    const frac = p.topMeter / 100;
    ctx.strokeStyle = frac > 0.7 ? '#ff5a4a' : frac > 0.35 ? '#ffb347' : '#ffd65a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, hud) {
  ctx.fillStyle = 'rgba(8, 10, 16, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, 34);
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.hud;
  ctx.fillText(hud.levelName, 12, 17);
  // Intel pips
  for (let i = 0; i < hud.intelTotal; i++) {
    const x = VIEW_W - 330 + i * 22;
    ctx.save();
    ctx.translate(x, 17);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i < hud.intelGot ? PALETTE.intel : 'rgba(120,130,150,0.35)';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }
  ctx.fillStyle = PALETTE.hud;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${hud.score}`, VIEW_W - 130, 17);
  const mm = String(Math.floor(hud.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(hud.time % 60)).padStart(2, '0');
  ctx.fillText(`${mm}:${ss}`, VIEW_W - 12, 17);
  // Alert bar
  if (hud.topMeter > 2) {
    const w = 220;
    const x = (VIEW_W - w) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 2, 40, w + 4, 10);
    ctx.fillStyle = hud.topMeter > 70 ? '#ff5a4a' : hud.topMeter > 35 ? '#ffb347' : '#ffd65a';
    ctx.fillRect(x, 41, (w * hud.topMeter) / 100, 8);
  }
  if (hud.alerted) {
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = Math.floor(hud.time * 4) % 2 === 0 ? '#ff5a4a' : '#ffb0a8';
    ctx.fillText('SPOTTED — BREAK LINE OF SIGHT!', VIEW_W / 2, 66);
  }
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText('WASD / arrows move · Shift sneak · R restart · P pause · M mute', 12, VIEW_H - 10);
}

function drawOverlay(ctx, lines, accent) {
  ctx.fillStyle = 'rgba(6, 8, 14, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  let y = VIEW_H / 2 - (lines.length - 1) * 22;
  lines.forEach(([text, size, color], i) => {
    ctx.font = `${i === 0 ? 'bold ' : ''}${size}px sans-serif`;
    ctx.fillStyle = color || (i === 0 ? accent || PALETTE.hud : PALETTE.dim);
    ctx.textBaseline = 'middle';
    ctx.fillText(text, VIEW_W / 2, y);
    y += size + 16;
  });
}

export function render(ctx, game) {
  const time = game.time;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx, game.world, time);
  for (const g of game.guards) drawCone(ctx, g);
  for (const item of game.world.intel) {
    if (!item.taken) drawIntel(ctx, item, time);
  }
  drawExit(ctx, game.world.exit, game.exitOpen, time);
  for (const g of game.guards) drawGuard(ctx, g);
  drawPlayer(ctx, game.player, time);
  drawHud(ctx, {
    levelName: game.level.name,
    levelSub: game.level.sub,
    intelTotal: game.world.intel.length,
    intelGot: game.world.intel.filter((i) => i.taken).length,
    score: game.score,
    time: game.levelTime,
    topMeter: game.topMeter,
    alerted: game.alerted,
  });

  if (game.mode === 'title') {
    drawOverlay(ctx, [
      ['SHADOW COURIER', 44, '#2fd6c0'],
      ['A courier. Three archives. One quiet night.', 17],
      ['Slip past the guards, take every intel cache, reach the exit unseen.', 15],
      ['Yellow cones are watching — shadows and crates hide you.', 15],
      ['Sneak with Shift. Running is fast, loud, and easy to spot.', 15],
      ['Press Enter to begin', 20, '#dfe6f2'],
    ]);
  } else if (game.mode === 'caught') {
    drawOverlay(ctx, [
      ['CAUGHT', 44, '#ff5a4a'],
      ['A guard got a hand on you. The archive stays locked tonight.', 16],
      [`Score ${game.score}`, 18, '#dfe6f2'],
      ['Press R to retry this level · Enter for the title screen', 15],
    ]);
  } else if (game.mode === 'levelclear') {
    drawOverlay(ctx, [
      ['CLEAN GETAWAY', 40, '#4fe07a'],
      [`${game.level.name} cleared — ${game.clearBonus} bonus points`, 17],
      [`Score ${game.score}`, 18, '#dfe6f2'],
      ['Press Enter for the next level', 15],
    ]);
  } else if (game.mode === 'victory') {
    drawOverlay(ctx, [
      ['THE NIGHT IS YOURS', 40, '#4fe07a'],
      ['Every archive emptied. Every guard still wondering what that noise was.', 16],
      [`Final score ${game.score}`, 20, '#dfe6f2'],
      ['Press Enter to run it again', 15],
    ]);
  } else if (game.mode === 'paused') {
    drawOverlay(ctx, [
      ['PAUSED', 40],
      ['Press P to keep sneaking', 16],
    ]);
  }
}
