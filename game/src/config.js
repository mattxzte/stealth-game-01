// Shadow Courier — shared tuning numbers and palette.
// Every value here is picked for how the game feels: a guard should spot a
// careless runner fast, a sneaking courier in the dark much slower.

export const TILE = 40;
export const COLS = 24;
export const ROWS = 16;
export const VIEW_W = COLS * TILE;
export const VIEW_H = ROWS * TILE;

export const PLAYER_RADIUS = 13;
export const GUARD_RADIUS = 14;

export const WALK_SPEED = 152;
export const SNEAK_SPEED = 74;
export const GUARD_PATROL_SPEED = 56;
export const GUARD_CHASE_SPEED = 168;
export const GUARD_RETURN_SPEED = 84;

export const CONE_RANGE = 212;
export const CONE_HALF_ANGLE = 0.66; // radians, about 38 degrees each side

export const METER_SUSPICIOUS = 35;
export const METER_ALERTED = 100;
export const METER_DECAY = 26;
export const METER_CLOSE_RATE = 62;
export const METER_FAR_RATE = 20;

export const SNEAK_DETECTION = 0.45;
export const SHADOW_DETECTION = 0.5;
export const MOVING_DETECTION = 1.35;

export const NOISE_WALK = 104;
export const NOISE_SNEAK = 34;

export const LOSE_SIGHT_SECONDS = 3.5;
export const CATCH_DISTANCE = 22;
export const INTEL_PICKUP_DISTANCE = 24;
export const EXIT_REACH_DISTANCE = 28;

export const SCORE_INTEL = 500;
export const SCORE_LEVEL = 1000;
export const SCORE_GHOST = 300;
export const SCORE_SPOTTED = 200;
export const TIME_BONUS_MAX = 500;
export const TIME_BONUS_PER_SECOND = 8;

export const PALETTE = {
  floorA: '#20242e',
  floorB: '#1c2029',
  shadowFloor: '#151824',
  wall: '#39415a',
  wallTop: '#4d5878',
  crate: '#6e4f27',
  crateEdge: '#4a3416',
  intel: '#37e6d4',
  exitLocked: '#c94f4f',
  exitOpen: '#4fe07a',
  player: '#2fd6c0',
  guard: '#e05545',
  coneCalm: 'rgba(255, 214, 90, 0.10)',
  coneSuspicious: 'rgba(255, 150, 60, 0.16)',
  coneAlerted: 'rgba(255, 70, 60, 0.20)',
  hud: '#dfe6f2',
  dim: '#8b93a7',
};
