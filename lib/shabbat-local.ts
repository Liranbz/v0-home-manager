// Local backup for Shabbat start/end when the Hebcal API is unreachable.
// Uses the NOAA sunset approximation (accurate to ~1-2 min), candle lighting
// 18 min before Friday sunset (as Hebcal with b=18), Shabbat end 42 min after
// Saturday sunset (slightly later than Hebcal's tzeit, so the mode never ends
// early).

const NETANYA = { lat: 32.3215, lon: 34.8532 }
const CANDLE_MIN_BEFORE_SUNSET = 18
const HAVDALAH_MIN_AFTER_SUNSET = 42

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Sunset as a Date (absolute instant) for the given civil date at lat/lon. */
export function sunsetOn(year: number, month: number, day: number, lat = NETANYA.lat, lon = NETANYA.lon): Date {
  const dayStart = Date.UTC(year, month - 1, day)
  const jan1 = Date.UTC(year, 0, 1)
  const n = Math.floor((dayStart - jan1) / 86400000) + 1
  const g = ((2 * Math.PI) / 365) * (n - 1 + 0.5) // fractional year at noon
  const eqtime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g))
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g)
  const zenith = rad(90.833)
  const ha = deg(Math.acos(Math.cos(zenith) / (Math.cos(rad(lat)) * Math.cos(decl)) - Math.tan(rad(lat)) * Math.tan(decl)))
  const sunsetMinutesUTC = 720 - 4 * (lon - ha) - eqtime
  return new Date(dayStart + sunsetMinutesUTC * 60000)
}

export interface ShabbatWindow {
  start: Date // candle lighting
  end: Date // havdalah
}

/**
 * The Shabbat window that is current or next, relative to `now`, computed
 * locally. Friday/Saturday are taken from the device's local calendar (the TV
 * is in Israel).
 */
export function localShabbatWindow(now = new Date()): ShabbatWindow {
  const d = new Date(now)
  // Walk back to the most recent Friday (today if Friday).
  const daysSinceFriday = (d.getDay() - 5 + 7) % 7
  d.setDate(d.getDate() - daysSinceFriday)
  const build = (friday: Date): ShabbatWindow => {
    const sat = new Date(friday)
    sat.setDate(friday.getDate() + 1)
    const start = new Date(sunsetOn(friday.getFullYear(), friday.getMonth() + 1, friday.getDate()).getTime() - CANDLE_MIN_BEFORE_SUNSET * 60000)
    const end = new Date(sunsetOn(sat.getFullYear(), sat.getMonth() + 1, sat.getDate()).getTime() + HAVDALAH_MIN_AFTER_SUNSET * 60000)
    return { start, end }
  }
  let w = build(d)
  if (now.getTime() >= w.end.getTime()) {
    d.setDate(d.getDate() + 7)
    w = build(d)
  }
  return w
}
