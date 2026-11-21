# Shadow Courier

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![Rank](https://make.fun/badge/best-stealth-game-20261121-1759/mattxzte/stealth-game-01/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![Reward](https://make.fun/badge/best-stealth-game-20261121-1759/mattxzte/stealth-game-01/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

A top-down stealth game for the make.fun bounty
[Make the best stealth game](https://make.fun/bounty/best-stealth-game-20261121-1759).
You are a courier slipping through guarded archives at night: learn the patrols,
stay out of the vision cones, grab every intel cache, and reach the exit unseen.

## How it plays

- **Move** with WASD or the arrow keys. **Shift** sneaks: slower, quieter, and
  much harder to spot.
- **Guards** walk patrol routes with vision cones. Walls and crates block their
  sight; dark shadow patches halve how fast they notice you.
- A guard that gets curious stops, turns toward you, and comes to look. A guard
  that fills its meter chases you and radios the others — break line of sight
  and hide until it calms down.
- **Running is loud**: guards nearby hear footsteps and investigate. Their own
  footsteps get louder as they get closer, so you can hear a patrol coming.
- Collect every intel cache to open the exit, then reach it to clear the level.
  Three levels, escalating patrols. Score rewards intel, speed, and a clean run
  with no alerts.

## Play it

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080 in a desktop browser
```

No build step, no network requests, no dependencies — static files under
`game/`, all art and sound made in code.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes
`dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

---

Entered on [make.fun](https://make.fun/?ref=nv10mx49&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards
