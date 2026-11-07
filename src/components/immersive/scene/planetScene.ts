/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fixed full-viewport WebGL planet (Ascend reference), one renderer, scroll-driven.
 *
 * three r0.143 is loaded lazily from a pinned CDN URL through an injected import map,
 * because the reference shaders rely on r143 chunk names (onBeforeCompile injection),
 * WebGL1Renderer and `outputEncoding`. Nothing here is imported at app start-up.
 * Every failure path rejects so the caller can show the CSS atmosphere fallback.
 */
import {
  CLOUD_FRAG_TAIL, CLOUD_UNIFORMS_GLSL, FINAL_FRAG, FINAL_VERT, GLOW_FRAG, GLOW_VERT,
  MARKER_FRAG, MARKER_VERT, MOTE_FRAG, MOTE_VERT, PLANET_FRAG_TAIL, PLANET_UNIFORMS_GLSL,
  SNOISE, STAR_FRAG, STAR_VERT,
} from './shaders'

const THREE_VERSION = '0.143.0'
const CDN = `https://unpkg.com/three@${THREE_VERSION}`
const ASSET_BASE = 'https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2'
const PLANET_GLB = `${ASSET_BASE}/planet.glb`
const PLANET_LIGHTS_GLB = `${ASSET_BASE}/planet-lights.glb`
const PLANET_CLOUDS_PNG = `${ASSET_BASE}/planet-clouds.png`
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'

export const CONFIG = {
  rimColor: '#c1faff', rimPower: 2.4, nightLights: 10, terrainDepth: 0.33, terrainShade: 1.3,
  oceanGlint: 0.45, oceanDeep: 0.12, oceanFlow: 3, oceanFlowSpeed: 0.8, oceanFlowScale: 2.1,
  glowColor: '#3a6cff', glowIntensity: 3.35, planetRadius: 1.95, spin: 0.03, initRotation: 2.07,
  tilt: 0.37, autoRotate: 0,
  cloud1Height: 1.005, cloud1Opacity: 0.6, cloud1Spin: 0.06,
  cloud2Height: 1.03, cloud2Opacity: 0.5, cloud2Spin: 0.14,
  cloud3Height: 1.075, cloud3Opacity: 0.5, cloud3Spin: 0.1,
  bgColor: '#040a1e', flameColor: '#3a6cff', flameColor2: '#c1faff', flameAmt: 0.15,
  atmoColor: '#9fc4ff', atmoCount: 320, atmoSize: 22, atmoSpeed: 0.8,
  starColor: '#cfe0ff', starCount: 1400, starSize: 1.6, starFlicker: 1,
  markerColor: '#ffd27a', markerCount: 60, markerSize: 16, markerSpeed: 0.5,
}
const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }

type Stop = { p: number; v: number }
const STOPS_X: Stop[] = [{ p: 0, v: 0 }, { p: 0.32, v: -3.1 }, { p: 0.64, v: 3.2 }, { p: 1, v: 0 }]
const STOPS_Y: Stop[] = [{ p: 0, v: -4.5 }, { p: 0.32, v: 0.55 }, { p: 0.64, v: 0.45 }, { p: 1, v: 0.15 }]
const STOPS_S: Stop[] = [{ p: 0, v: 2.15 }, { p: 0.32, v: 1.0 }, { p: 0.64, v: 0.92 }, { p: 1, v: 1.12 }]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
function sample(stops: Stop[], p: number) {
  if (p <= stops[0].p) return stops[0].v
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1]
    if (p <= b.p) { const t = (p - a.p) / (b.p - a.p); return lerp(a.v, b.v, t * t * (3 - 2 * t)) }
  }
  return stops[stops.length - 1].v
}

export type SceneOptions = {
  canvas: HTMLCanvasElement
  reducedMotion: boolean
  lowPower: boolean
  /** 0..1 scroll progress of the dashboard (read each frame). */
  getProgress: () => number
  onReady?: (info: { procedural: boolean }) => void
  onContextLost?: () => void
}
export type SceneHandle = {
  dispose: () => void
  setPaused: (paused: boolean) => void
  resize: () => void
}

let threePromise: Promise<any> | null = null
function ensureImportMap() {
  // index.html ships the import map statically (required: maps added after a module loads may be ignored).
  // This is only a best-effort safety net for pages that do not.
  if (document.querySelector('script[type="importmap"]')) return
  const s = document.createElement('script')
  s.type = 'importmap'
  s.setAttribute('data-lt-three-map', '1')
  s.textContent = JSON.stringify({
    imports: { three: `${CDN}/build/three.module.js`, 'three/examples/jsm/': `${CDN}/examples/jsm/` },
  })
  document.head.appendChild(s)
}
function loadThree(): Promise<any> {
  if (!threePromise) {
    ensureImportMap()
    const imp = (u: string) => import(/* @vite-ignore */ u)
    const J = 'three/examples/jsm/'
    threePromise = Promise.all([
      imp('three'),
      imp(`${J}postprocessing/EffectComposer.js`), imp(`${J}postprocessing/RenderPass.js`),
      imp(`${J}postprocessing/UnrealBloomPass.js`), imp(`${J}postprocessing/ShaderPass.js`),
      imp(`${J}shaders/GammaCorrectionShader.js`), imp(`${J}shaders/CopyShader.js`),
      imp(`${J}loaders/GLTFLoader.js`), imp(`${J}loaders/DRACOLoader.js`), imp(`${J}controls/OrbitControls.js`),
    ]).then(([THREE, ec, rp, ub, sp, gc, cs, gl, dr, oc]) => ({
      THREE, EffectComposer: ec.EffectComposer, RenderPass: rp.RenderPass, UnrealBloomPass: ub.UnrealBloomPass,
      ShaderPass: sp.ShaderPass, GammaCorrectionShader: gc.GammaCorrectionShader, CopyShader: cs.CopyShader,
      GLTFLoader: gl.GLTFLoader, DRACOLoader: dr.DRACOLoader, OrbitControls: oc.OrbitControls,
    }))
    threePromise.catch(() => { threePromise = null })
  }
  return threePromise
}

/** Cheap value-noise used only when the hosted planet assets cannot be loaded. */
function proceduralTextures(size = 512) {
  const w = size * 2, h = size
  const rnd = (() => { let s = 1337; return () => ((s = (s * 16807) % 2147483647) / 2147483647) })()
  const grid = 64, g = Array.from({ length: (grid + 1) * (grid + 1) }, () => rnd())
  const vn = (x: number, y: number) => {
    const gx = (x * grid) % grid, gy = y * grid, x0 = Math.floor(gx), y0 = Math.floor(gy)
    const fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
    const at = (i: number, j: number) => g[Math.min(j, grid) * (grid + 1) + (i % grid)]
    return lerp(lerp(at(x0, y0), at(x0 + 1, y0), sx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), sx), sy)
  }
  const fbm = (x: number, y: number) => 0.55 * vn(x, y) + 0.3 * vn(x * 2 % 1, y * 2 % 1) + 0.15 * vn(x * 4 % 1, y * 4 % 1)
  const day = document.createElement('canvas'), night = document.createElement('canvas'), cloud = document.createElement('canvas')
  ;[day, night, cloud].forEach(c => { c.width = w; c.height = h })
  const dc = day.getContext('2d')!, nc = night.getContext('2d')!, cc = cloud.getContext('2d')!
  const di = dc.createImageData(w, h), ni = nc.createImageData(w, h), ci = cc.createImageData(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / w, v = y / h, n = fbm(u, v), land = n > 0.52, polar = Math.abs(v - 0.5) > 0.44
    const i = (y * w + x) * 4
    const col = polar ? [235, 242, 250] : land ? [60 + n * 90, 110 + n * 70, 55 + n * 30] : [10, 40 + n * 40, 110 + n * 70]
    di.data.set([col[0], col[1], col[2], 255], i)
    const lit = land && rnd() > 0.985 ? 255 : 0
    ni.data.set([lit, lit * 0.8, lit * 0.45, 255], i)
    const cn = fbm((u + 0.37) % 1, (v + 0.11) % 1), a = clamp((cn - 0.5) * 3.2, 0, 1)
    ci.data.set([255, 255, 255, a * 255], i)
  }
  dc.putImageData(di, 0, 0); nc.putImageData(ni, 0, 0); cc.putImageData(ci, 0, 0)
  return { day, night, cloud }
}

export async function createPlanetScene(opts: SceneOptions): Promise<SceneHandle> {
  const lib = await loadThree()
  const { THREE, EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, GammaCorrectionShader, CopyShader, GLTFLoader, DRACOLoader, OrbitControls } = lib
  const { canvas, reducedMotion, lowPower, getProgress } = opts
  const hexToVec3 = (hex: string) => { const c = new THREE.Color(hex); return new THREE.Vector3(c.r, c.g, c.b) }
  const maxDpr = lowPower ? 1.25 : 2
  const dpr = () => Math.min(window.devicePixelRatio || 1, maxDpr)

  const renderer = new THREE.WebGL1Renderer({ canvas, antialias: !lowPower })
  renderer.setPixelRatio(dpr())
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.set(0, 0, 8)
  camera.layers.enable(LAYERS.TORUS_SCENE); camera.layers.enable(LAYERS.BLOOM_SCENE); camera.layers.enable(LAYERS.ENTIRE_SCENE)
  scene.add(camera)
  const ambient = new THREE.AmbientLight(0xffffff, 1.8); ambient.layers.set(LAYERS.ENTIRE_SCENE); scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); dirLight.position.set(0, 10, 2); dirLight.layers.set(LAYERS.ENTIRE_SCENE); scene.add(dirLight)

  // ── composers ──
  const W = () => window.innerWidth, H = () => window.innerHeight
  const torusComposer = new EffectComposer(renderer); torusComposer.renderToScreen = false
  torusComposer.addPass(new RenderPass(scene, camera)); torusComposer.addPass(new ShaderPass(GammaCorrectionShader))
  torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.22, 0.2, 0)); torusComposer.addPass(new ShaderPass(CopyShader))
  const bloomComposer = new EffectComposer(renderer); bloomComposer.renderToScreen = false
  bloomComposer.addPass(new RenderPass(scene, camera)); bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.5, 0.6, 0))
  bloomComposer.addPass(new ShaderPass(GammaCorrectionShader))
  const FinalPass = {
    uniforms: {
      iTime: { value: 0 }, tDiffuse: { value: null }, torusTexture: { value: torusComposer.renderTarget1.texture },
      bloomTexture: { value: bloomComposer.renderTarget1.texture }, haloTexture: { value: null },
      uBg: { value: hexToVec3(CONFIG.bgColor) }, uFlameA: { value: hexToVec3(CONFIG.flameColor) },
      uFlameB: { value: hexToVec3(CONFIG.flameColor2) }, uFlameAmt: { value: CONFIG.flameAmt },
    },
    vertexShader: FINAL_VERT, fragmentShader: FINAL_FRAG,
  }
  const finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(new RenderPass(scene, camera))
  const finalPass = new ShaderPass(FinalPass); finalComposer.addPass(finalPass)

  const controls = new OrbitControls(camera, renderer.domElement)
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.06, enablePan: false, enabled: false, autoRotate: true, autoRotateSpeed: CONFIG.autoRotate, minDistance: 3.5, maxDistance: 16 })
  controls.target.set(0, 0, 0)

  // ── hierarchy ──
  const worldGroup = new THREE.Group(); scene.add(worldGroup)
  const planetGroup = new THREE.Group(); planetGroup.rotation.z = CONFIG.tilt; worldGroup.add(planetGroup)
  const cloudGroup = new THREE.Group(); cloudGroup.rotation.z = CONFIG.tilt; cloudGroup.visible = false; worldGroup.add(cloudGroup)
  worldGroup.position.set(STOPS_X[0].v, STOPS_Y[0].v, 0); worldGroup.scale.setScalar(STOPS_S[0].v)

  const uRes = { value: new THREE.Vector2(W() * dpr(), H() * dpr()) }
  const disposables: Array<{ dispose: () => void }> = []

  // glow
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uGlow: { value: hexToVec3(CONFIG.glowColor) }, uIntensity: { value: CONFIG.glowIntensity } },
    vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  const glowGeo = new THREE.PlaneGeometry(2, 2)
  const glowMesh = new THREE.Mesh(glowGeo, glowMat)
  glowMesh.scale.setScalar(CONFIG.planetRadius * 2.3)
  glowMesh.layers.set(LAYERS.ENTIRE_SCENE); glowMesh.layers.enable(LAYERS.BLOOM_SCENE)
  worldGroup.add(glowMesh); disposables.push(glowMat, glowGeo)

  // motes
  const atmoCount = lowPower ? Math.round(CONFIG.atmoCount * 0.4) : CONFIG.atmoCount
  const moteGeo = new THREE.BufferGeometry()
  const mp = new Float32Array(atmoCount * 3), ms = new Float32Array(atmoCount), mseed = new Float32Array(atmoCount)
  for (let i = 0; i < atmoCount; i++) {
    mp.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], i * 3)
    ms[i] = CONFIG.atmoSize * (0.4 + Math.random()); mseed[i] = Math.random() * 100
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3)); moteGeo.setAttribute('size', new THREE.BufferAttribute(ms, 1)); moteGeo.setAttribute('seed', new THREE.BufferAttribute(mseed, 1))
  const moteMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uRes, uColor: { value: new THREE.Color(CONFIG.atmoColor) } },
    vertexShader: MOTE_VERT, fragmentShader: MOTE_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  })
  const motes = new THREE.Points(moteGeo, moteMat); motes.frustumCulled = false; motes.layers.set(LAYERS.ENTIRE_SCENE)
  motes.onBeforeRender = () => {
    const t = performance.now() / 1000
    moteMat.uniforms.uTime.value = t * CONFIG.atmoSpeed * 8
    motes.position.copy(camera.position)
    finalPass.uniforms.iTime.value = reducedMotion ? 0 : t
  }
  scene.add(motes); disposables.push(moteGeo, moteMat)

  // stars
  const starCount = lowPower ? 600 : CONFIG.starCount
  const starGeo = new THREE.BufferGeometry()
  const sp = new Float32Array(starCount * 3), ss = new Float32Array(starCount), sb = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) {
    const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u)
    sp.set([90 * r * Math.cos(a), 90 * u, 90 * r * Math.sin(a)], i * 3); ss[i] = Math.random() * 100; sb[i] = 0.35 + Math.random() * 0.65
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); starGeo.setAttribute('seed', new THREE.BufferAttribute(ss, 1)); starGeo.setAttribute('bright', new THREE.BufferAttribute(sb, 1))
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSize: { value: CONFIG.starSize }, uFlicker: { value: CONFIG.starFlicker }, uColor: { value: new THREE.Color(CONFIG.starColor) }, uRes },
    vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
  })
  const stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; stars.layers.set(LAYERS.ENTIRE_SCENE)
  scene.add(stars); disposables.push(starGeo, starMat)

  // ── assets (hosted) with procedural fallback ──
  const planetTime = { value: 0 }, cloudTime = { value: 0 }, markerTime = { value: 0 }
  const cloudMeshes: Array<{ mesh: any; spinKey: 'cloud1Spin' | 'cloud2Spin' | 'cloud3Spin' }> = []
  let planetMesh: any = null
  let procedural = false
  let disposed = false

  const withTimeout = <T,>(p: Promise<T>, ms: number) => new Promise<T>((res, rej) => { const id = setTimeout(() => rej(new Error('asset timeout')), ms); p.then(v => { clearTimeout(id); res(v) }, e => { clearTimeout(id); rej(e) }) })
  const draco = new DRACOLoader(); draco.setDecoderPath(DRACO_PATH)
  const gltf = new GLTFLoader(); gltf.setDRACOLoader(draco)
  const loadGLB = (url: string) => withTimeout(new Promise<any>((res, rej) => gltf.load(url, res, undefined, rej)), 20000)
  const firstMesh = (root: any) => { let m: any = null; root.traverse((o: any) => { if (!m && o.isMesh) m = o }); return m }

  let nightTex: any, baseMesh: any, cloudTex: any
  try {
    const [lights, planet, tex] = await Promise.all([
      loadGLB(PLANET_LIGHTS_GLB), loadGLB(PLANET_GLB),
      withTimeout(new Promise<any>((res, rej) => new THREE.TextureLoader().load(PLANET_CLOUDS_PNG, res, undefined, rej)), 20000),
    ])
    nightTex = firstMesh(lights.scene)?.material?.map
    baseMesh = firstMesh(planet.scene); cloudTex = tex
    if (!nightTex || !baseMesh) throw new Error('planet assets incomplete')
  } catch {
    procedural = true
    const t = proceduralTextures(lowPower ? 256 : 512)
    const mk = (c: HTMLCanvasElement) => { const x = new THREE.CanvasTexture(c); x.encoding = THREE.sRGBEncoding; return x }
    const dayTex = mk(t.day); nightTex = mk(t.night); cloudTex = mk(t.cloud)
    baseMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), new THREE.MeshStandardMaterial({ map: dayTex }))
  }
  if (disposed) return { dispose() {}, setPaused() {}, resize() {} }

  // planet
  baseMesh.geometry.computeBoundingSphere()
  const bs = baseMesh.geometry.boundingSphere?.radius || 1
  baseMesh.scale.setScalar(CONFIG.planetRadius / bs)
  const pmat = baseMesh.material.clone()
  Object.assign(pmat, { metalness: 0, roughness: 1, envMapIntensity: 0 })
  const planetUniforms: Record<string, { value: any }> = {
    time: planetTime, noiseScale: { value: 30 }, speedX: { value: 1.5 }, speedY: { value: 2.0 }, speedZ: { value: 2.5 },
    rimColor: { value: hexToVec3(CONFIG.rimColor) }, rimPower: { value: CONFIG.rimPower }, nightBlendTexture: { value: nightTex },
    nightLights: { value: CONFIG.nightLights }, terrainDepth: { value: CONFIG.terrainDepth }, terrainShade: { value: CONFIG.terrainShade },
    oceanGlint: { value: CONFIG.oceanGlint }, oceanDeep: { value: CONFIG.oceanDeep }, oceanFlow: { value: CONFIG.oceanFlow },
    oceanFlowSpeed: { value: CONFIG.oceanFlowSpeed }, oceanFlowScale: { value: CONFIG.oceanFlowScale },
  }
  pmat.onBeforeCompile = (shader: any) => {
    Object.assign(shader.uniforms, planetUniforms)
    shader.vertexShader = 'varying vec2 vCustomUv;\n' + shader.vertexShader.replace('void main() {', 'void main() {\n vCustomUv = uv;')
    shader.fragmentShader = PLANET_UNIFORMS_GLSL + SNOISE + shader.fragmentShader.replace('#include <dithering_fragment>', PLANET_FRAG_TAIL)
  }
  pmat.needsUpdate = true
  baseMesh.material = pmat
  baseMesh.layers.set(LAYERS.ENTIRE_SCENE)
  planetGroup.add(baseMesh); planetMesh = baseMesh
  disposables.push(pmat)

  // clouds
  cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping; cloudTex.repeat.set(5, 5)
  const layers = [
    { h: CONFIG.cloud1Height, o: CONFIG.cloud1Opacity, s: 'cloud1Spin' as const, ry: 0.0, phase: 0.0 },
    { h: CONFIG.cloud2Height, o: CONFIG.cloud2Opacity, s: 'cloud2Spin' as const, ry: 2.2, phase: 13.0 },
    { h: CONFIG.cloud3Height, o: CONFIG.cloud3Opacity, s: 'cloud3Spin' as const, ry: 4.3, phase: 27.0 },
  ]
  for (const L of layers) {
    const geo = new THREE.SphereGeometry(CONFIG.planetRadius * L.h, lowPower ? 40 : 64, lowPower ? 40 : 64)
    const mat = new THREE.MeshStandardMaterial({ map: cloudTex, transparent: true, depthWrite: false })
    const u = { uTime: cloudTime, noiseScale: { value: 20 }, uSpeedX: { value: 1 }, uSpeedY: { value: 2 }, uSpeedZ: { value: 2 }, uOpacity: { value: L.o }, uPhase: { value: L.phase } }
    mat.onBeforeCompile = (shader: any) => {
      Object.assign(shader.uniforms, u)
      shader.vertexShader = 'varying vec2 vCloudUv;\n' + shader.vertexShader.replace('void main() {', 'void main() {\n vCloudUv = uv;')
      shader.fragmentShader = CLOUD_UNIFORMS_GLSL + SNOISE + shader.fragmentShader.replace('#include <dithering_fragment>', CLOUD_FRAG_TAIL)
    }
    const mesh = new THREE.Mesh(geo, mat); mesh.rotation.y = L.ry; mesh.renderOrder = 2; mesh.layers.set(LAYERS.ENTIRE_SCENE)
    cloudGroup.add(mesh); cloudMeshes.push({ mesh, spinKey: L.s }); disposables.push(geo, mat)
  }
  cloudGroup.visible = true

  // land markers
  try {
    const img: any = baseMesh.material.map?.image
    if (img) {
      const cv = document.createElement('canvas'); const iw = img.width || 1024, ih = img.height || 512
      cv.width = iw; cv.height = ih
      const cx = cv.getContext('2d', { willReadFrequently: true })!; cx.drawImage(img, 0, 0, iw, ih)
      const data = cx.getImageData(0, 0, iw, ih).data
      const geo = baseMesh.geometry, pos = geo.attributes.position, uvA = geo.attributes.uv, idx = geo.index
      const triCount = idx ? idx.count / 3 : pos.count / 3
      const vi = (t: number, k: number) => (idx ? idx.getX(t * 3 + k) : t * 3 + k)
      const cum = new Float32Array(triCount); let total = 0
      const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
      for (let t = 0; t < triCount; t++) {
        a.fromBufferAttribute(pos, vi(t, 0)); b.fromBufferAttribute(pos, vi(t, 1)); c.fromBufferAttribute(pos, vi(t, 2))
        total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2; cum[t] = total
      }
      const count = lowPower ? Math.round(CONFIG.markerCount / 2) : CONFIG.markerCount
      const mpos: number[] = [], mseed2: number[] = []
      for (let tries = 0; mpos.length / 3 < count && tries < count * 60; tries++) {
        const r = Math.random() * total; let lo = 0, hi = triCount - 1
        while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid }
        let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v }
        const w = 1 - u - v, i0 = vi(lo, 0), i1 = vi(lo, 1), i2 = vi(lo, 2)
        const tu = uvA.getX(i0) * w + uvA.getX(i1) * u + uvA.getX(i2) * v, tv = uvA.getY(i0) * w + uvA.getY(i1) * u + uvA.getY(i2) * v
        const px = clamp(Math.floor(tu * iw), 0, iw - 1), py = clamp(Math.floor((1 - tv) * ih), 0, ih - 1), o = (py * iw + px) * 4
        const cr = data[o], cg = data[o + 1], cb = data[o + 2]
        if (cb > cr + 6 && cb > cg + 6) continue
        a.fromBufferAttribute(pos, i0).multiplyScalar(w); b.fromBufferAttribute(pos, i1).multiplyScalar(u); c.fromBufferAttribute(pos, i2).multiplyScalar(v)
        a.add(b).add(c).multiplyScalar(1.012); mpos.push(a.x, a.y, a.z); mseed2.push(Math.random())
      }
      if (mpos.length) {
        const mg = new THREE.BufferGeometry()
        mg.setAttribute('position', new THREE.Float32BufferAttribute(mpos, 3)); mg.setAttribute('seed', new THREE.Float32BufferAttribute(mseed2, 1))
        const mm = new THREE.ShaderMaterial({
          uniforms: { uTime: markerTime, uColor: { value: new THREE.Color(CONFIG.markerColor) }, uSize: { value: CONFIG.markerSize }, uSpeed: { value: CONFIG.markerSpeed }, uRes },
          vertexShader: MARKER_VERT, fragmentShader: MARKER_FRAG, transparent: true, blending: THREE.AdditiveBlending, depthTest: true, depthWrite: false,
        })
        const pts = new THREE.Points(mg, mm); pts.layers.set(LAYERS.ENTIRE_SCENE); pts.layers.enable(LAYERS.BLOOM_SCENE)
        planetMesh.add(pts); disposables.push(mg, mm)
      }
    }
  } catch { /* canvas tainted by CORS or unreadable texture: markers are decorative, skip them */ }

  // ── loop ──
  let curP = 0, curX = STOPS_X[0].v, curY = STOPS_Y[0].v, curS = STOPS_S[0].v
  let spinPhase = 0, starTime = 0, entryT = reducedMotion ? 1 : 0, last = performance.now(), raf = 0, paused = false, running = true
  const ENTRY_DUR = 1.9, ENTRY_START_Y = -6.5
  const frame = (now: number) => {
    if (!running) return
    raf = requestAnimationFrame(frame)
    if (paused || document.hidden) { last = now; return }
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    const mdt = reducedMotion ? 0 : dt
    planetTime.value += mdt / 12; cloudTime.value += mdt / 20; starTime += mdt; markerTime.value += mdt
    starMat.uniforms.uTime.value = starTime
    const pTarget = clamp(getProgress(), 0, 1)
    curP += (pTarget - curP) * (reducedMotion ? 1 : Math.min(1, dt * 4.5))
    const sideScale = clamp(window.innerWidth / 1200, 0.5, 1), k = reducedMotion ? 1 : Math.min(1, dt * 3.2)
    curX += (sample(STOPS_X, curP) * sideScale - curX) * k
    curY += (sample(STOPS_Y, curP) - curY) * k
    curS += (sample(STOPS_S, curP) - curS) * k
    if (entryT < 1) entryT = Math.min(1, entryT + dt / ENTRY_DUR)
    const e = 1 - Math.pow(1 - entryT, 3), entryY = ENTRY_START_Y * (1 - e)
    worldGroup.position.set(curX, curY + entryY, 0); worldGroup.scale.setScalar(curS)
    spinPhase += mdt * CONFIG.spin
    planetGroup.rotation.y = CONFIG.initRotation + spinPhase + curP * Math.PI * 1.6
    for (const c of cloudMeshes) c.mesh.rotation.y += mdt * (CONFIG as any)[c.spinKey]
    glowMesh.quaternion.copy(camera.quaternion)
    controls.update()
    camera.layers.set(LAYERS.TORUS_SCENE); torusComposer.render()
    camera.layers.set(LAYERS.BLOOM_SCENE); bloomComposer.render()
    camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render()
  }
  raf = requestAnimationFrame(frame)

  const resize = () => {
    const w = W(), h = H(), r = dpr()
    camera.aspect = w / h; camera.updateProjectionMatrix()
    renderer.setPixelRatio(r); renderer.setSize(w, h, false)
    ;[torusComposer, bloomComposer, finalComposer].forEach(c => { c.setPixelRatio(r); c.setSize(w, h) })
    uRes.value.set(w * r, h * r)
  }
  window.addEventListener('resize', resize)
  const onLost = (e: Event) => { e.preventDefault(); running = false; cancelAnimationFrame(raf); opts.onContextLost?.() }
  canvas.addEventListener('webglcontextlost', onLost)

  opts.onReady?.({ procedural })
  return {
    setPaused: (v) => { paused = v },
    resize,
    dispose() {
      disposed = true; running = false; cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize); canvas.removeEventListener('webglcontextlost', onLost)
      controls.dispose?.(); draco.dispose?.()
      disposables.forEach(d => { try { d.dispose() } catch { /* already disposed */ } })
      ;[torusComposer, bloomComposer, finalComposer].forEach(c => { try { c.renderTarget1?.dispose(); c.renderTarget2?.dispose() } catch { /* noop */ } })
      cloudTex?.dispose?.(); nightTex?.dispose?.()
      renderer.dispose(); renderer.forceContextLoss?.()
    },
  }
}
