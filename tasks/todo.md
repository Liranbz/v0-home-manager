# Lobby dashboard fixes (2026-10-22)

Plan: ~/.claude/plans/great-i-have-some-curried-robin.md

- [x] 1. News ticker: keep last headlines on failure, RTL direction, no animation restart; harden /api/ynet
- [x] 2. Shabbat: new /api/shabbat (Hebcal geonameid), no fake fallback, refresh after havdalah
- [x] 3. YouTube: IFrame API on nocookie host, 640x360 scaled (360p), auto-skip on error, real slideshow images
- [x] 4. Performance: remove canvas rAF loops, blur, 3D transforms; Hebrew font; nightly reload
- [x] 5. /api/version route
- [x] 6. Local build + dev verification
- [ ] 7. Commit, push, verify all three Vercel URLs

## Review
(filled at the end)
