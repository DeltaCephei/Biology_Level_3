/**
 * DNAHelix.tsx
 *
 * A procedurally generated, stylised DNA double helix rendered with
 * React Three Fiber. Designed as the hero visual for the Level 3
 * Biology course platform.
 *
 * Geometry overview:
 *   - Two sugar-phosphate backbone strands spiral around the Y axis.
 *   - Base-pair "rungs" connect the strands at regular intervals.
 *   - ~20 base pairs are visible.
 *
 * Colour scheme (bioluminescent):
 *   - Backbone strand A: cyan  (#7df9ff)
 *   - Backbone strand B: green (#00ff88)
 *   - Base-pair rungs:   purple (#9b59b6) with emissive glow
 */

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Total number of base pairs to render. */
const BASE_PAIR_COUNT = 20

/** Vertical spacing between each base pair (world units). */
const VERTICAL_STEP = 0.45

/** Radius of the helix (distance from the central axis to a backbone strand). */
const HELIX_RADIUS = 1.2

/** How much the helix twists per base pair (radians). One full turn ≈ 10 bp. */
const TWIST_PER_STEP = (2 * Math.PI) / 10

/** Number of segments used to approximate the backbone tube curves. */
const BACKBONE_TUBE_SEGMENTS = 128

/** Cross-section radius of the backbone tubes. */
const BACKBONE_TUBE_RADIUS = 0.06

/** Colours */
const CYAN = new THREE.Color('#7df9ff')
const GREEN = new THREE.Color('#00ff88')
const PURPLE = new THREE.Color('#9b59b6')

/* ------------------------------------------------------------------ */
/*  Helper: build a CatmullRomCurve3 for one backbone strand          */
/* ------------------------------------------------------------------ */

function buildBackboneCurve(phaseOffset: number): THREE.CatmullRomCurve3 {
  // Oversample points so the tube is smooth
  const points: THREE.Vector3[] = []
  const totalSteps = BASE_PAIR_COUNT * 4 // 4x oversampling
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / 4 // maps back to base-pair index space
    const angle = t * TWIST_PER_STEP + phaseOffset
    const y = t * VERTICAL_STEP - (BASE_PAIR_COUNT * VERTICAL_STEP) / 2 // centre vertically
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * HELIX_RADIUS,
        y,
        Math.sin(angle) * HELIX_RADIUS,
      ),
    )
  }
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
}

/* ------------------------------------------------------------------ */
/*  Sub-component: BackboneStrand                                      */
/* ------------------------------------------------------------------ */

interface BackboneStrandProps {
  phaseOffset: number
  colour: THREE.Color
}

const BackboneStrand = React.memo(function BackboneStrand({
  phaseOffset,
  colour,
}: BackboneStrandProps) {
  const geometry = useMemo(() => {
    const curve = buildBackboneCurve(phaseOffset)
    return new THREE.TubeGeometry(
      curve,
      BACKBONE_TUBE_SEGMENTS,
      BACKBONE_TUBE_RADIUS,
      8, // radial segments
      false,
    )
  }, [phaseOffset])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
})

/* ------------------------------------------------------------------ */
/*  Sub-component: BasePairRungs                                       */
/* ------------------------------------------------------------------ */

/**
 * Renders all base-pair rungs as a single InstancedMesh for performance.
 * Each rung is a thin cylinder connecting the two backbone strands.
 */
const BasePairRungs = React.memo(function BasePairRungs() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Pre-compute instance matrices once
  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D()
    const result: THREE.Matrix4[] = []

    for (let i = 0; i < BASE_PAIR_COUNT; i++) {
      const angle = i * TWIST_PER_STEP
      const y = i * VERTICAL_STEP - (BASE_PAIR_COUNT * VERTICAL_STEP) / 2

      const ax = Math.cos(angle) * HELIX_RADIUS
      const az = Math.sin(angle) * HELIX_RADIUS
      const bx = Math.cos(angle + Math.PI) * HELIX_RADIUS
      const bz = Math.sin(angle + Math.PI) * HELIX_RADIUS

      const cx = (ax + bx) / 2
      const cz = (az + bz) / 2
      const length = HELIX_RADIUS * 2

      dummy.position.set(cx, y, cz)
      dummy.lookAt(bx, y, bz)
      dummy.rotateX(Math.PI / 2)
      dummy.scale.set(1, length / 2, 1)
      dummy.updateMatrix()
      result.push(dummy.matrix.clone())
    }
    return result
  }, [])

  // Apply matrices to instanced mesh on mount
  React.useEffect(() => {
    if (!meshRef.current) return
    matrices.forEach((mat, i) => {
      meshRef.current!.setMatrixAt(i, mat)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BASE_PAIR_COUNT]}>
      <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
      <meshStandardMaterial
        color={PURPLE}
        emissive={PURPLE}
        emissiveIntensity={0.35}
        roughness={0.4}
        metalness={0.05}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
})

/* ------------------------------------------------------------------ */
/*  Sub-component: BackboneNodes (spheres at each base-pair junction)  */
/* ------------------------------------------------------------------ */

/**
 * Small spheres at each backbone attachment point to give a
 * "ball-and-stick" feel. Rendered as two InstancedMeshes
 * (one per strand) for efficiency.
 */
const BackboneNodes = React.memo(function BackboneNodes({
  phaseOffset,
  colour,
}: BackboneStrandProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D()
    const result: THREE.Matrix4[] = []

    for (let i = 0; i < BASE_PAIR_COUNT; i++) {
      const angle = i * TWIST_PER_STEP + phaseOffset
      const y = i * VERTICAL_STEP - (BASE_PAIR_COUNT * VERTICAL_STEP) / 2
      dummy.position.set(
        Math.cos(angle) * HELIX_RADIUS,
        y,
        Math.sin(angle) * HELIX_RADIUS,
      )
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      result.push(dummy.matrix.clone())
    }
    return result
  }, [phaseOffset])

  React.useEffect(() => {
    if (!meshRef.current) return
    matrices.forEach((mat, i) => {
      meshRef.current!.setMatrixAt(i, mat)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BASE_PAIR_COUNT]}>
      <sphereGeometry args={[0.09, 8, 6]} />
      <meshStandardMaterial
        color={colour}
        emissive={colour}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  )
})

/* ------------------------------------------------------------------ */
/*  Main component: DNAHelix                                           */
/* ------------------------------------------------------------------ */

/**
 * The complete DNA double helix group.
 * Rotates slowly on the Y axis and bobs gently up and down.
 */
export default function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Slow continuous Y-axis rotation
    groupRef.current.rotation.y = t * 0.15

    // Gentle sinusoidal bobbing on Y
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.15
  })

  return (
    <group ref={groupRef}>
      {/* Backbone strand A (cyan, phase 0) */}
      <BackboneStrand phaseOffset={0} colour={CYAN} />
      <BackboneNodes phaseOffset={0} colour={CYAN} />

      {/* Backbone strand B (green, phase π — opposite side) */}
      <BackboneStrand phaseOffset={Math.PI} colour={GREEN} />
      <BackboneNodes phaseOffset={Math.PI} colour={GREEN} />

      {/* Base-pair rungs connecting the two strands */}
      <BasePairRungs />
    </group>
  )
}
