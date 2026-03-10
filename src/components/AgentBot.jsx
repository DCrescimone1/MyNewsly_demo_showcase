// MODULE F — MyNewsly Agent Bot
// A minimal SVG robot centered at canvas (490, 365).
// Positioned: left=440, top=305, SVG 100×120.
//
// Props: state — 'hidden' | 'idle' | 'active'
//   hidden → invisible
//   idle   → gentle eye pulse
//   active → bright pulsing eyes + expanding glow ring

import { motion, AnimatePresence } from 'motion/react'

export default function AgentBot({ state = 'hidden' }) {
  const visible  = state !== 'hidden'
  const isActive = state === 'active'

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: visible ? 1 : 0.5, opacity: visible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      style={{
        position: 'absolute',
        left: 350,
        top: 305,
        width: 100,
        willChange: 'transform',
      }}
    >
      {/* Expanding glow ring — fires once on 'active', then vanishes */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="ring"
            initial={{ scale: 0.8, opacity: 0.75 }}
            animate={{ scale: 3.0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 12, left: 0,
              width: 100, height: 100,
              borderRadius: '50%',
              border: '1.5px solid #9B30FF',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
        {/* ── Antenna ───────────────────────────────────────── */}
        <line x1="50" y1="0" x2="50" y2="16"
          stroke="#9B30FF" strokeWidth="2" strokeLinecap="round" />
        <motion.circle
          cx="50" cy="5" r="4" fill="#9B30FF"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Head ──────────────────────────────────────────── */}
        <rect x="12" y="16" width="76" height="52" rx="12"
          fill="#1A1A2E" stroke="#9B30FF" strokeWidth="1.5" />

        {/* Eye sockets */}
        <circle cx="34" cy="42" r="9" fill="#0D0D1A" stroke="#9B30FF" strokeWidth="1" />
        <circle cx="66" cy="42" r="9" fill="#0D0D1A" stroke="#9B30FF" strokeWidth="1" />

        {/* Eye pupils — pulse faster when active */}
        <motion.circle
          cx="34" cy="42" r="4.5" fill="#9B30FF"
          animate={
            isActive
              ? { opacity: [1, 0.25, 1], r: [4.5, 6.5, 4.5] }
              : { opacity: [0.45, 1, 0.45] }
          }
          transition={{ duration: isActive ? 0.35 : 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="66" cy="42" r="4.5" fill="#9B30FF"
          animate={
            isActive
              ? { opacity: [1, 0.25, 1], r: [4.5, 6.5, 4.5] }
              : { opacity: [0.45, 1, 0.45] }
          }
          transition={{ duration: isActive ? 0.35 : 2, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
        />

        {/* Mouth track */}
        <rect x="28" y="57" width="44" height="5" rx="2.5" fill="#0D0D1A" />
        {/* Mouth fill — animates when active */}
        <motion.rect
          x="28" y="57" height="5" rx="2.5" fill="#2962FF"
          initial={{ width: 0 }}
          animate={{ width: isActive ? 44 : 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />

        {/* ── Torso ─────────────────────────────────────────── */}
        <rect x="22" y="70" width="56" height="40" rx="9"
          fill="#1A1A2E" stroke="#2962FF" strokeWidth="1" opacity="0.85" />
        {/* Center line */}
        <line x1="50" y1="74" x2="50" y2="106"
          stroke="#9B30FF" strokeWidth="1" opacity="0.3" />
        {/* Core circle */}
        <circle cx="50" cy="90" r="7"
          fill="#0D0D1A" stroke="#9B30FF" strokeWidth="1" opacity="0.8" />
        <motion.circle
          cx="50" cy="90" r="3" fill="#9B30FF"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>

    </motion.div>
  )
}
