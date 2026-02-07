/**
 * HeroScene.tsx
 *
 * Wrapper component that renders the DNA helix inside a Three.js Canvas
 * with an overlaid hero text block. Designed to be used as an Astro
 * `client:visible` island for lazy hydration.
 *
 * Layout:
 *   - Full-width container with a fixed height (70vh on desktop).
 *   - The 3D Canvas fills the container with a transparent background.
 *   - Hero text ("Level 3 Biology" + subtitle) is absolutely positioned
 *     on top of the scene.
 *   - A CSS shimmer skeleton shows while Three.js is loading.
 */

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import DNAHelix from './DNAHelix'

/* ------------------------------------------------------------------ */
/*  Loading fallback (CSS shimmer skeleton)                            */
/* ------------------------------------------------------------------ */

function LoadingFallback() {
  return (
    <div style={styles.fallbackOuter}>
      <div style={styles.fallbackShimmer}>
        {/* Inline keyframes via a <style> tag — keeps the component self-contained */}
        <style>{`
          @keyframes dna-shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
        `}</style>
        <div style={styles.fallbackBar} />
        <div style={{ ...styles.fallbackBar, width: '60%', marginTop: '0.8rem' }} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HeroScene                                                          */
/* ------------------------------------------------------------------ */

export default function HeroScene() {
  return (
    <div style={styles.container}>
      {/* 3D Canvas — transparent background so the page colour shows through */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          style={{ background: 'transparent' }}
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
        >
          {/* Lighting — subtle ambient fill + two point lights for depth */}
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#7df9ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.5} color="#00ff88" />

          {/* The DNA helix itself */}
          <DNAHelix />

          {/* OrbitControls: user can rotate / zoom with limits */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={12}
            minPolarAngle={Math.PI / 4}   // prevent flipping over the top
            maxPolarAngle={(3 * Math.PI) / 4} // prevent flipping under
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Canvas>
      </Suspense>

      {/* Hero text overlay — sits above the Canvas via absolute positioning */}
      <div style={styles.overlay}>
        <h1 style={styles.heading}>Level 3 Biology</h1>
        <p style={styles.subtitle}>Your week-by-week course companion</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline styles                                                      */
/*                                                                     */
/*  Using a styles object rather than CSS modules so this component    */
/*  remains fully self-contained and works out of the box in Astro     */
/*  without additional configuration.                                  */
/* ------------------------------------------------------------------ */

const styles: Record<string, React.CSSProperties> = {
  /* Root container — relative so the overlay can be positioned absolutely */
  container: {
    position: 'relative',
    width: '100%',
    height: '70vh',
    minHeight: '420px',
    overflow: 'hidden',
  },

  /* Hero text overlay */
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // allow clicks to pass through to the Canvas
    zIndex: 1,
    padding: '1rem',
  },

  heading: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    color: '#ffffff',
    textShadow: '0 2px 20px rgba(125, 249, 255, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)',
    margin: 0,
    letterSpacing: '-0.02em',
    textAlign: 'center' as const,
  },

  subtitle: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 'clamp(0.95rem, 2vw, 1.25rem)',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: '0.6rem',
    textShadow: '0 1px 10px rgba(0, 0, 0, 0.5)',
    textAlign: 'center' as const,
  },

  /* Loading fallback — shimmer skeleton */
  fallbackOuter: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  },

  fallbackShimmer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  fallbackBar: {
    width: '240px',
    height: '1.2rem',
    borderRadius: '0.6rem',
    background: 'linear-gradient(90deg, rgba(125,249,255,0.05) 0%, rgba(125,249,255,0.15) 50%, rgba(125,249,255,0.05) 100%)',
    backgroundSize: '800px 100%',
    animation: 'dna-shimmer 1.8s ease-in-out infinite',
  },
}
