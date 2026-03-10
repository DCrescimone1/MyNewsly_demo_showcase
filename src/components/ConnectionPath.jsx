// MODULE C — Connection Animation
// Props:
//   connections — array of { id, sx, sy, ex, ey, delay, strokeWidth }
//   flowMode    — when true: lines persist with a per-path directional pulse
//   onComplete  — fired when all paths finish drawing

import { motion, AnimatePresence, useTime, useTransform } from 'motion/react'

// ─── Generate a smooth cubic bezier between two points ───────────────────
export function makePath(sx, sy, ex, ey) {
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.hypot(dx, dy)
  if (len < 1) return `M ${sx} ${sy}`
  const nx = -dy / len
  const ny =  dx / len
  const bow = len * 0.18
  const cp1x = Math.round(sx + dx * 0.35 + nx * bow)
  const cp1y = Math.round(sy + dy * 0.35 + ny * bow)
  const cp2x = Math.round(ex - dx * 0.35 + nx * bow)
  const cp2y = Math.round(ey - dy * 0.35 + ny * bow)
  return `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`
}

// ─── Pulse period ─────────────────────────────────────────────────────────
// How long (ms) for one bright pulse to travel from logo to dashboard.
const PULSE_PERIOD = 1800
const HALF_W       = 0.06  // pulse half-width — keep it tight (≈12% of wire)

// ─── Single wire — handles both draw-in and flow mode ────────────────────
//
// In draw-in mode (flowMode=false):
//   Animates pathLength 0→1 using the shared static gradient.
//
// In flow mode (flowMode=true):
//   Injects its own per-path <linearGradient> aligned exactly from (sx,sy)
//   to (ex,ey), so the colour direction matches every wire individually.
//   Three motion.stop offsets are driven by useTime+useTransform each frame,
//   creating a bright pulse that travels from the logo end toward the dashboard.
//   No re-renders — Motion writes directly to SVG attributes.
//
function Connection({ conn, flowMode, onDone }) {
  const { id, sx, sy, ex, ey, delay = 0, strokeWidth = 2 } = conn
  const gradId = `cxf_${id}`
  const d = makePath(sx, sy, ex, ey)

  // Hooks must be called unconditionally (React rules).
  // In draw-in mode, no motion.stop elements read these values
  // so Motion never writes to the DOM for them → zero overhead.
  const time  = useTime()
  const pulse = useTransform(() => (time.get() % PULSE_PERIOD) / PULSE_PERIOD)

  const o1 = useTransform(() => `${Math.max(0,       pulse.get() - HALF_W) * 100}%`)
  const o2 = useTransform(() => `${                  pulse.get()            * 100}%`)
  const o3 = useTransform(() => `${Math.min(1,       pulse.get() + HALF_W)  * 100}%`)

  return (
    <>
      {/*
        The per-path gradient is ALWAYS mounted (not conditional on flowMode).
        Reason: cxGradient uses gradientUnits="objectBoundingBox" which maps
        0%→100% to bounding-box left→right. For right-column wires (sx=1170,
        ex=1000) this puts purple at the dashboard end — the wrong direction.
        By always using the per-path gradient (x1/y1=logo, x2/y2=dashboard)
        the direction is correct from draw-in through flow mode, so the stroke
        reference never changes and there is no colour snap on transition.

        During draw-in the gradient has two static stops (purple→blue, full
        opacity). When flowMode starts, three animated motion.stop elements are
        added; the bright stop fades in so the pulse appears gradually rather
        than flashing on.
      */}
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={sx} y1={sy}
          x2={ex} y2={ey}
        >
          <stop offset="0%"   stopColor="#9B30FF" />
          {flowMode && <motion.stop offset={o1} stopColor="#9B30FF" />}
          {flowMode && (
            <motion.stop
              offset={o2}
              stopColor="#D08AFF"
              initial={{ stopOpacity: 0 }}
              animate={{ stopOpacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
          )}
          {flowMode && <motion.stop offset={o3} stopColor="#2962FF" />}
          <stop offset="100%" stopColor="#2962FF" />
        </linearGradient>
      </defs>

      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
        strokeDasharray="8 6"
        strokeLinecap="round"
        filter={flowMode ? 'url(#glowFilter)' : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={!flowMode ? { opacity: 0, transition: { duration: 0.4 } } : undefined}
        transition={{
          pathLength: { duration: 0.9, ease: 'easeInOut', delay },
          opacity:    { duration: 0.25, delay },
        }}
        onAnimationComplete={onDone}
      />
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ConnectionPath({ connections = [], flowMode = false, onComplete }) {
  if (!connections.length) return null

  let completed = 0
  function handleDone() {
    completed += 1
    if (completed >= connections.length && onComplete) onComplete()
  }

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '1280px', height: '720px',
        overflow: 'visible', pointerEvents: 'none', zIndex: 5,
      }}
      viewBox="0 0 1280 720"
    >
      <defs>
        {/* Static gradient — used during the draw-in phase */}
        <linearGradient id="cxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#9B30FF" />
          <stop offset="100%" stopColor="#2962FF" />
        </linearGradient>

        {/* Glow filter — only mounted when flowMode is active */}
        {flowMode && (
          <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <AnimatePresence>
        {connections.map((conn) => (
          <Connection key={conn.id} conn={conn} flowMode={flowMode} onDone={handleDone} />
        ))}
      </AnimatePresence>
    </svg>
  )
}
