// MODULE C — Connection Animation
// Props:
//   connections — array of { id, sx, sy, ex, ey, delay, strokeWidth }
//   onComplete  — fired when all paths finish drawing

import { motion, AnimatePresence } from 'motion/react'

// ─── Generate a smooth cubic bezier between two points ───────────────────
export function makePath(sx, sy, ex, ey) {
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.hypot(dx, dy)
  if (len < 1) return `M ${sx} ${sy}`
  const nx = -dy / len   // perpendicular unit (CCW)
  const ny =  dx / len
  const bow = len * 0.18
  const cp1x = Math.round(sx + dx * 0.35 + nx * bow)
  const cp1y = Math.round(sy + dy * 0.35 + ny * bow)
  const cp2x = Math.round(ex - dx * 0.35 + nx * bow)
  const cp2y = Math.round(ey - dy * 0.35 + ny * bow)
  return `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`
}

// ─── Single animated path (draws itself, then fades) ─────────────────────
function Connection({ conn, onDone }) {
  const { sx, sy, ex, ey, delay = 0, strokeWidth = 2 } = conn
  const pathD = makePath(sx, sy, ex, ey)

  return (
    <motion.path
      d={pathD}
      fill="none"
      stroke="url(#cxGradient)"
      strokeWidth={strokeWidth}
      strokeDasharray="8 6"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{
        pathLength: { duration: 0.9, ease: 'easeInOut', delay },
        opacity: { duration: 0.25, delay },
      }}
      onAnimationComplete={onDone}
    />
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ConnectionPath({ connections = [], onComplete }) {
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
        <linearGradient id="cxGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#9B30FF" />
          <stop offset="100%" stopColor="#2962FF" />
        </linearGradient>
      </defs>

      <AnimatePresence>
        {connections.map((conn) => (
          <Connection key={conn.id} conn={conn} onDone={handleDone} />
        ))}
      </AnimatePresence>
    </svg>
  )
}
