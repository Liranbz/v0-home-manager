# Lessons

- 2026-10-22: `pkill -f "next start"` does not kill a running Next.js production server (its process title is `next-server`). The new server then fails with EADDRINUSE and the browser keeps hitting the old build. Always kill by the PID listening on the port: `kill $(lsof -nP -tiTCP:<port> -sTCP:LISTEN)`, and confirm the served HTML contains a marker from the new build before testing.
- 2026-10-22: YouTube auto quality is driven by the player's PHYSICAL size (CSS px × devicePixelRatio). 640x360 physical → 480p; smaller boxes do not go lower on auto. Measure with `YT.get(iframe.id).getPlaybackQuality()` instead of assuming.
