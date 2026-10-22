# Lobby dashboard fixes (2026-10-22)

Plan: ~/.claude/plans/great-i-have-some-curried-robin.md

- [x] 1. News ticker: keep last headlines on failure, RTL direction, no animation restart; harden /api/ynet
- [x] 2. Shabbat: new /api/shabbat (Hebcal geonameid), no fake fallback, refresh after havdalah
- [x] 3. YouTube: IFrame API on nocookie host, 640x360 scaled (360p), auto-skip on error, real slideshow images
- [x] 4. Performance: remove canvas rAF loops, blur, 3D transforms; Hebrew font; nightly reload
- [x] 5. /api/version route
- [x] 6. Local build + dev verification
- [x] 7. Commit, push, verify all three Vercel URLs

## Review (2026-10-22)

Commits on main: 7cb28d3 (fixes), 8b8fc61 (Next.js 15.2.4 -> 15.5.28, required because Vercel blocks the old version as vulnerable).

Verified locally (prod build, Chrome): /api/ynet 12 headlines, /api/shabbat Netanya 17:39 / 18:35 / לך־לך, ticker scrolls start-first with no blank gap at 90 px/s, YouTube player playing muted at 480p ("large") via a 640x360-physical box, no console errors, layout fits 96vh with no overflow.

YouTube quality note: 1280x720 physical -> 720p, 640x360 -> 480p, 480x270 -> still 480p. YouTube auto does not go below 480p, so 480p is the floor we can force from the page.

Deployments (GitHub push auto-deploys the bzliran projects; the dsg-team project also picked up the commit):
- https://v0-home-manager-liran-dsgais-projects.vercel.app -> 8b8fc61
- https://v0-hagiladscreen.vercel.app -> 8b8fc61
- https://v0-home-manager-5tp9.vercel.app -> see final status in chat
Vercel returns cache-control max-age=0 to clients and honours s-maxage at its CDN (x-vercel-cache), so the API caching works as intended.

Open items for the user: confirm on the TV which URL it shows; then retire the duplicate Vercel projects (v0-home-manager, v0-home-manager-huu4, and the two unused ones).
