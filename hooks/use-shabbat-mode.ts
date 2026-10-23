"use client"

import { useEffect, useState } from "react"
import { localShabbatWindow } from "@/lib/shabbat-local"

// Shabbat mode: active from candle lighting (Friday) until havdalah (Saturday
// night). Times come from /api/shabbat (Hebcal); if that is unreachable a
// local sunset calculation for Netanya is used so the mode still works.
// `?shabbat=1` forces it on and `?shabbat=0` forces it off, for testing.

const REFRESH_MS = 6 * 60 * 60 * 1000
const RETRY_MS = 10 * 60 * 1000
const TICK_MS = 30 * 1000

interface Window {
  start: Date
  end: Date
  parasha: string | null
  havdalah: string | null // HH:MM
  source: "hebcal" | "local"
}

export interface ShabbatMode {
  active: boolean
  parasha: string | null
  havdalah: string | null
  source: "hebcal" | "local" | null
}

function forcedMode(): boolean | null {
  if (typeof window === "undefined") return null
  const v = new URLSearchParams(window.location.search).get("shabbat")
  if (v === "1") return true
  if (v === "0") return false
  return null
}

export function useShabbatMode(): ShabbatMode {
  const [win, setWin] = useState<Window | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Fetch the window (Hebcal via our API, local calculation as backup).
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(load, ms)
    }

    const load = async () => {
      try {
        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), 10000)
        const res = await fetch("/api/shabbat?city=netanya", { signal: controller.signal, cache: "no-store" })
        clearTimeout(t)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const start = new Date(data.candleISO)
        const end = new Date(data.havdalahISO)
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("bad dates")
        if (cancelled) return
        setWin({ start, end, parasha: data.parasha ?? null, havdalah: data.havdalah ?? null, source: "hebcal" })
        // Refresh a couple of minutes after havdalah so the next window loads,
        // and in any case every 6 h.
        const untilEnd = end.getTime() - Date.now() + 2 * 60 * 1000
        schedule(untilEnd > 0 && untilEnd < REFRESH_MS ? untilEnd : REFRESH_MS)
      } catch (err) {
        console.warn("Shabbat mode: Hebcal unavailable, using local sunset calculation", err)
        if (cancelled) return
        const w = localShabbatWindow()
        const hh = String(w.end.getHours()).padStart(2, "0")
        const mm = String(w.end.getMinutes()).padStart(2, "0")
        setWin({ start: w.start, end: w.end, parasha: null, havdalah: `${hh}:${mm}`, source: "local" })
        schedule(RETRY_MS)
      }
    }

    load()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Clock tick so the mode flips at the right minute.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [])

  const forced = forcedMode()
  const computed = win ? now >= win.start.getTime() && now < win.end.getTime() : false
  const active = forced ?? computed

  return {
    active,
    parasha: win?.parasha ?? null,
    havdalah: win?.havdalah ?? null,
    source: win?.source ?? null,
  }
}
