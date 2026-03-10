// MODULE E — Agent Logo Column
// 5 fixed slots on the left; logos cycle through the full pool every 2.5 s.
// Props:
//   phase   — 'idle' | 'active' | 'done'
//   cycling — boolean, starts the rotation timer

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const ALL_SOURCES = [
  { id: 'guardian',   label: 'The Guardian',  src: '/logos/the-guardian-new-2018.svg' },
  { id: 'reuters',    label: 'Reuters',       src: '/logos/reuters-6.svg' },
  { id: 'wired',      label: 'Wired',         src: '/logos/wired.svg' },
  { id: 'forbes',     label: 'Forbes',        src: '/logos/forbes-2.svg' },
  { id: 'bbc',        label: 'BBC',           src: '/logos/bbc-2.svg' },
  { id: 'cnn',        label: 'CNN',           src: '/logos/cnn-3.svg' },
  { id: 'techcrunch', label: 'TechCrunch',    src: '/logos/techchrunch.svg' },
  { id: 'vogue',      label: 'Vogue',         src: '/logos/vogue.svg' },
  { id: 'natgeo',     label: 'Nat Geo',       src: '/logos/national-geographic-channel.svg' },
  { id: 'economist',  label: 'The Economist', src: '/logos/the economist_logo.svg' },
  { id: 'nyt',        label: 'NYT',           src: '/logos/the-new-york-times.svg',          logoSize: { w: 82, h: 56 } },
  { id: 'adobepdf',   label: 'Adobe PDF',     src: '/logos/adobe-pdf-icon.svg' },
  { id: 'wsj',        label: 'WSJ',           src: '/logos/the-wall-street-journal-1.svg',   logoSize: { w: 80, h: 50 } },
]

// First 5 visible on load
const INITIAL_SLOTS = ['guardian', 'reuters', 'cnn', 'bbc', 'techcrunch']
// Remaining pool to rotate in
const POOL = ALL_SOURCES.map(s => s.id).filter(id => !INITIAL_SLOTS.includes(id))

// Card top positions (card h=60, so vertical center = y+30)
const SLOT_Y = [80, 195, 310, 425, 540]

const CARD_W = 90
const CARD_H = 60

function sourceById(id) {
  return ALL_SOURCES.find(s => s.id === id)
}

function LogoCard({ source, phase, slotIndex }) {
  const shadow =
    phase === 'active' || phase === 'done'
      ? '0 2px 12px rgba(155,48,255,0.15), 0 1px 4px rgba(0,0,0,0.15)'
      : '0 2px 8px rgba(0,0,0,0.2)'

  return (
    <div
      style={{
        width: CARD_W, height: CARD_H,
        background: '#fff', borderRadius: 12,
        boxShadow: shadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={source.src}
        alt={source.label}
        style={{
          maxWidth: source.logoSize?.w ?? 64,
          maxHeight: source.logoSize?.h ?? 40,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

export default function AgentLogoColumn({ phase = 'idle', cycling = false }) {
  const [slots, setSlots] = useState(INITIAL_SLOTS)

  useEffect(() => {
    if (!cycling) return

    let poolIdx    = 0
    let slotCursor = 0

    const timer = setInterval(() => {
      const nextId   = POOL[poolIdx % POOL.length]
      const swapSlot = slotCursor % 5
      poolIdx++
      slotCursor++
      setSlots(prev => {
        const next = [...prev]
        next[swapSlot] = nextId
        return next
      })
    }, 2500)

    return () => clearInterval(timer)
  }, [cycling])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {slots.map((sourceId, slotIndex) => {
        const source = sourceById(sourceId)
        if (!source) return null
        return (
          <div
            key={slotIndex}
            style={{
              position: 'absolute', left: 20, top: SLOT_Y[slotIndex],
              width: CARD_W, height: CARD_H,
            }}
          >
            <AnimatePresence>
              <motion.div
                key={sourceId}
                style={{ position: 'absolute', top: 0, left: 0 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale:
                    phase === 'active'
                      ? [1, 1.03, 1]
                      : phase === 'done'
                      ? 0.97
                      : 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={
                  phase === 'active'
                    ? {
                        opacity: { duration: 0.35 },
                        scale: {
                          repeat: Infinity,
                          duration: 2,
                          ease: 'easeInOut',
                          delay: slotIndex * 0.2,
                        },
                      }
                    : { opacity: { duration: 0.35 }, scale: { duration: 0.3 } }
                }
              >
                <LogoCard source={source} phase={phase} slotIndex={slotIndex} />
              </motion.div>
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
