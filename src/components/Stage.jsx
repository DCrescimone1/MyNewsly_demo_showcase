// MODULE A — Stage & Background
// Static canvas: dark base + two brand-color radial glows + optional dot grid.
// Nothing animates here. This is purely the mood-setter.

export default function Stage() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0A0A0F',
        overflow: 'hidden',
        willChange: 'transform',
      }}
    >
      {/* Left glow — Bright Purple #9B30FF at 8% opacity */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          left: '5%',
          top: '50%',
          transform: 'translate(-10%, -50%)',
          background: 'radial-gradient(circle, rgba(155, 48, 255, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Right glow — Royal Blue #2962FF at 5% opacity */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          right: '5%',
          top: '50%',
          transform: 'translate(10%, -50%)',
          background: 'radial-gradient(circle, rgba(41, 98, 255, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dot grid overlay — 1px white dots at 5% opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
