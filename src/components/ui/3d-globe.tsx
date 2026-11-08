import { Html, OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

export type GlobeMarker = {
  lat: number
  lng: number
  label: string
  metric: string
  color?: string
}

type GlobeConfig = {
  radius?: number
  textureUrl?: string
  atmosphereColor?: string
  autoRotateSpeed?: number
  enableZoom?: boolean
}

type Globe3DProps = {
  markers?: GlobeMarker[]
  config?: GlobeConfig
  className?: string
  onMarkerHover?: (marker: GlobeMarker | null) => void
}

const DEFAULT_TEXTURE = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'

const toPoint = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function Atmosphere({ radius, color }: { radius: number; color: string }) {
  return <mesh scale={1.08}>
    <sphereGeometry args={[radius, 64, 64]} />
    <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
  </mesh>
}

function Marker({ marker, radius, onHover }: { marker: GlobeMarker; radius: number; onHover: (marker: GlobeMarker | null) => void }) {
  const position = useMemo(() => toPoint(marker.lat, marker.lng, radius + 0.06), [marker, radius])
  const [active, setActive] = useState(false)
  const color = marker.color ?? '#62d8ff'

  return <group position={position}>
    <mesh
      onPointerEnter={() => { setActive(true); onHover(marker) }}
      onPointerLeave={() => { setActive(false); onHover(null) }}
    >
      <sphereGeometry args={[active ? 0.075 : 0.055, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
    <mesh rotation={[0, 0, 0]}>
      <ringGeometry args={[0.08, 0.105, 24]} />
      <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.38} side={THREE.DoubleSide} />
    </mesh>
    {active && <Html distanceFactor={6} position={[0.1, 0.1, 0]} center>
      <div className="globe-marker-tooltip"><strong>{marker.label}</strong><span>{marker.metric}</span></div>
    </Html>}
  </group>
}

function GlobeMesh({ markers, config, onHover }: { markers: GlobeMarker[]; config: GlobeConfig; onHover: (marker: GlobeMarker | null) => void }) {
  const group = useRef<THREE.Group>(null)
  const texture = useTexture(config.textureUrl ?? DEFAULT_TEXTURE)
  const radius = config.radius ?? 1.65

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * (config.autoRotateSpeed ?? 0.12)
  })

  return <group ref={group} rotation={[0.08, -0.65, 0]}>
    <mesh>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial map={texture} color="#9dcaff" emissive="#062a52" emissiveIntensity={0.28} roughness={0.82} metalness={0.02} />
    </mesh>
    <Atmosphere radius={radius} color={config.atmosphereColor ?? '#4da6ff'} />
    {markers.map((marker) => <Marker key={`${marker.label}-${marker.lat}`} marker={marker} radius={radius} onHover={onHover} />)}
  </group>
}

class GlobeErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

function FallbackGlobe({ markers }: { markers: GlobeMarker[] }) {
  return <div className="globe-fallback" role="img" aria-label="Animated business signals globe unavailable in this browser">
    <div className="globe-fallback-core" />
    <div className="globe-fallback-ring globe-fallback-ring-one" />
    <div className="globe-fallback-ring globe-fallback-ring-two" />
    {markers.slice(0, 4).map((marker, index) => <span key={marker.label} className={`globe-fallback-dot globe-fallback-dot-${index}`} title={marker.label} />)}
  </div>
}

export function Globe3D({ markers = [], config = {}, className, onMarkerHover }: Globe3DProps) {
  const [failed, setFailed] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null)
  const [hovered, setHovered] = useState<GlobeMarker | null>(null)
  const handleHover = (marker: GlobeMarker | null) => { setHovered(marker); onMarkerHover?.(marker) }

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    setWebglAvailable(Boolean(context))
  }, [])

  if (failed || webglAvailable === false) return <FallbackGlobe markers={markers} />
  if (webglAvailable === null) return <div className="globe-canvas globe-loading" aria-label="Loading animated Earth globe" />

  const fallback = <FallbackGlobe markers={markers} />
  return <div className={`globe-canvas ${className ?? ''}`} aria-label={hovered ? `${hovered.label}: ${hovered.metric}` : 'Interactive animated Earth globe'}>
    <GlobeErrorBoundary fallback={fallback}>
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 4.9], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', () => setFailed(true), { once: true })
      }}
      fallback={<FallbackGlobe markers={markers} />}
    >
      <ambientLight intensity={config.atmosphereColor ? 1.15 : 0.85} />
      <directionalLight position={[3, 2, 4]} intensity={2.8} color="#d9f1ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#3c70ff" />
      <Suspense fallback={null}>
        <GlobeMesh markers={markers} config={config} onHover={handleHover} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={config.enableZoom ?? false} minDistance={4} maxDistance={6} rotateSpeed={0.32} autoRotate={false} />
    </Canvas>
    </GlobeErrorBoundary>
  </div>
}
