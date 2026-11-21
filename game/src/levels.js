// Shadow Courier — level layouts.
//
// Map legend (one character per tile):
//   #  wall — blocks movement and sight
//   C  crate — blocks movement and sight, low cover you can hide behind
//   ,  shadow floor — dark patch, guards spot you half as fast while you stand in it
//   .  open floor
//   P  where the courier starts
//   I  an intel cache to collect
//   E  the exit (opens once every cache is collected)
//   G  a guard spawn point (patrol routes are listed per level below)
//
// Guard patrols are lists of tile waypoints. Every leg of a route runs in a
// straight horizontal or vertical line down open floor, so a guard never has to
// squeeze around a corner mid-leg.

export const LEVELS = [
  {
    name: 'Night Archive',
    sub: 'Three caches. Learn the patrols. Stay out of the light.',
    map: [
      '########################',
      '#P....#......#....I....#',
      '#.....#..C...#....#....#',
      '#.C...#......#.C..#..C.#',
      '#.....#......#....#....#',
      '#..##.####.###.####....#',
      '#......................#',
      '#.C...#....C....#...E..#',
      '#.....#.........#......#',
      '#.####.#..####..#..##..#',
      '#.....#......#..#......#',
      '#.C...#.I....#..#..C...#',
      '#.....#......#..#......#',
      '#.#####..#####..#......#',
      '#...I....#....G........#',
      '########################',
    ],
    guards: [
      { x: 15, y: 14, patrol: [[15, 14], [22, 14], [22, 6], [15, 6]] },
      { x: 1, y: 6, patrol: [[1, 6], [1, 1], [5, 1], [5, 6]] },
      { x: 20, y: 1, patrol: [[20, 1], [20, 4], [19, 4], [19, 1]] },
    ],
  },
  {
    name: 'Server Vault',
    sub: 'More guards, tighter halls. The shadows are your friends.',
    map: [
      '########################',
      '#P..,#....C....#...I...#',
      '#....#.........#...#...#',
      '#.C..#..####..#...#.C..#',
      '#....#..#..#..#...#....#',
      '#....#..#..#..#...#....#',
      '#.####..#..#..#...#....#',
      '#......................#',
      '#..C....,....C....#..E.#',
      '#....###.....###..#....#',
      '#....#...#......#.#....#',
      '#.I..#...#..C...#.#.C..#',
      '#....#...#......#.#....#',
      '#....#...####...#.#....#',
      '#....#.......G.....#...#',
      '########################',
    ],
    guards: [
      { x: 11, y: 14, patrol: [[16, 14], [8, 14]] },
      { x: 4, y: 2, patrol: [[4, 2], [1, 2], [1, 1], [4, 1]] },
      { x: 22, y: 4, patrol: [[22, 4], [22, 7], [19, 7], [19, 4]] },
      { x: 2, y: 10, patrol: [[2, 10], [4, 10], [4, 14], [2, 14]] },
    ],
  },
  {
    name: 'Rooftop Relay',
    sub: 'Five guards on the roof. One clean run and the night is yours.',
    map: [
      '########################',
      '#P....#.....,.....I....#',
      '#..C..#.....#....#.....#',
      '#.....#..C..#....#.C...#',
      '#.....#.....#....#.....#',
      '#..####..####..###..#..#',
      '#......................#',
      '#.C...#....C.....#..E..#',
      '#.....#..........#.....#',
      '#.##..#..####....#.##..#',
      '#.....#......#...#.....#',
      '#.I...#.C....#...#..C..#',
      '#.....#......#...#.....#',
      '#..#..#..#####...#.....#',
      '#..#..#......G.........#',
      '########################',
    ],
    guards: [
      { x: 14, y: 14, patrol: [[14, 14], [22, 14], [22, 6], [14, 6]] },
      { x: 1, y: 4, patrol: [[1, 4], [5, 4], [5, 1], [1, 1]] },
      { x: 21, y: 1, patrol: [[21, 1], [22, 1], [22, 6], [21, 6]] },
      { x: 1, y: 12, patrol: [[1, 12], [5, 12], [5, 8], [1, 8]] },
      { x: 12, y: 6, patrol: [[12, 6], [13, 6], [13, 8], [12, 8]] },
    ],
  },
];
