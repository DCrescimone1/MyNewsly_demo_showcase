// MODULE D — Dashboard Population
// Centered in the 1280×720 canvas.
// Props: state — 'empty' | 'wave1' | 'wave2' | 'wave3'
//
// Dashboard bounds (used by ConnectionPath endpoint targeting in App.jsx):
//   left:160  right:1120  top:145  contentTop:181
//   width:960

import { motion, AnimatePresence } from 'motion/react'

const STATE_IMAGES = {
  empty: '/empty_dashboard.webp',
  wave1: '/1_dashboard_wired.webp',
  wave2: '/3_dashboard_wired_forbes_reuters.webp',
  wave3: '/full_dashboard.webp',
}

// Highlight ring canvas-absolute positions.
// Dashboard left=160, contentTop=181
// Rings indicate where new content appeared in the image.
const RINGS = {
  wave1: [
    // Wired article — Tech & Innovation, ~35% down content (193 + 0.35*371 ≈ 323)
    { x: 340, y: 280, label: 'Wired' },
  ],
  wave2: [
    // Reuters — Breaking News, ~18% down (193 + 0.18*371 ≈ 260)
    { x: 340, y: 245, label: 'Reuters' },
    // Forbes — Business & Markets, ~50% down (193 + 0.50*371 ≈ 379)
    { x: 340, y: 365, label: 'Forbes' },
  ],
  wave3: null,
}

function TrafficLights() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {['#FF5F57', '#FFBD2E', '#28C840'].map(c => (
        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
      ))}
    </div>
  )
}

function HighlightRing({ x, y }) {
  // x, y are canvas-absolute. Dashboard is at left=310, top=157.
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.9 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x - 160 - 40,
        top:  y - 145 - 40,
        width: 80, height: 80,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.85)',
        boxShadow: '0 0 18px rgba(155,48,255,0.5)',
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
}

function GlowSweep() {
  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0.8 }}
      animate={{ x: '200%', opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeInOut' }}
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(155,48,255,0.18) 40%, rgba(41,98,255,0.18) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
}

export default function Dashboard({ state = 'empty' }) {
  const rings = RINGS[state]

  return (
    // Centered: left=(1280-960)/2=160, top=145
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      style={{
        position: 'absolute',
        left: 160,
        top: 145,
        width: 960,
        willChange: 'transform',
      }}
    >
      <div style={{
        borderRadius: 14,
        border: '1px solid #1E1E2E',
        boxShadow: '0 24px 70px rgba(155,48,255,0.2), 0 6px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        background: '#12121A',
      }}>
        {/* Browser chrome */}
        <div style={{
          height: 36, background: '#1A1A2E',
          borderBottom: '1px solid #2A2A3E',
          display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 10, flexShrink: 0,
        }}>
          <TrafficLights />
          <div style={{
            flex: 1, height: 20, background: '#0D0D1A',
            borderRadius: 4, border: '1px solid #2A2A3E',
            display: 'flex', alignItems: 'center', paddingLeft: 8,
          }}>
            <span style={{ fontSize: 10, color: '#4A4A6A', fontFamily: 'system-ui, sans-serif' }}>
              www.mynewsly.com
            </span>
          </div>
        </div>

        {/* Content — objectFit:contain so the image is never cropped */}
        <div style={{ position: 'relative', width: '100%', background: '#f8f8f8', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={state}
              src={STATE_IMAGES[state]}
              alt={`dashboard-${state}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: state === 'wave3' ? 0.5 : 0.4, ease: 'easeInOut' }}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
              }}
            />
          </AnimatePresence>

          <AnimatePresence>
            {rings?.map(r => <HighlightRing key={`${state}-${r.label}`} x={r.x} y={r.y} />)}
          </AnimatePresence>

          <AnimatePresence>
            {state === 'wave3' && <GlowSweep key="sweep" />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
