// ============================================================================
//  Portal Door — 8th Wall (open source) interactive-art teaching component
// ----------------------------------------------------------------------------
//  ★ Students do NOT need to edit this file.
//    Put it in your project's src folder, then in the Inspector:
//    select any object → Add Component → portal-door. Every setting lives in the Inspector.
//
//  What it does: tap the ground to place a door → the other world (360 panorama or
//        sample garden) is visible ONLY through the doorway → walk through to enter it →
//        turn around and the doorway shows the real world. Walking around the side does not enter.
//
//  How it works (for instructors):
//    * Occluders: surfaces that write depth but no colour (colorWrite:false), drawn first
//      (renderOrder), hide the virtual content behind them so the camera feed shows through.
//    * Panorama mode: the panorama sphere follows the camera (appears infinitely far). Outside, a
//      clipping plane keeps only the half behind the door, plus a huge occluder wall with a door-shaped hole.
//    * Crossing test: the camera's movement segment (last frame → this frame) must pass through the doorway.
// ============================================================================

import * as ecs from '@8thwall/ecs'

const THREE = (window as any).THREE

const RO_REAL = -2       // door frame (real-world side)
const RO_OCCLUDER = -1   // invisible occluders
const MAX_TEXTURE = 4096 // panoramas wider than this are downscaled automatically (phone memory)
const PANO_CENTER_OFFSET = -90 // centre of the panorama faces the doorway
const MAX_STEP = 0.5     // a jump > 0.5 m in one frame is treated as tracking noise, not a crossing

type Config = {
  doorWidth: number
  doorHeight: number
  doorColor: string
  doorOpenAngle: number
  worldType: string
  panorama: string
  panoramaRotation: number
  panoramaBrightness: number
  enterSound: string
  insideSound: string
  soundVolume: number
  hintPlace: string
  hintApproach: string
  hintInside: string
  hintBack: string
  maxPlaceDistance: number
  doorwayMargin: number
  showDebug: boolean
}

const S: any = {
  cfg: null as Config | null,
  root: null,
  shell: null,
  doorwayHider: null,
  innerWorld: null,
  leafPivot: null,
  floaters: [],
  pano: null,
  panoClip: null,
  placed: false,
  inside: false,
  prevLocal: null,
  placeTime: 0,
  enterAudio: null as HTMLAudioElement | null,
  insideAudio: null as HTMLAudioElement | null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const occluderMat = () => new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: true, side: THREE.DoubleSide})
const setRenderOrder = (obj: any, order: number) => obj.traverse((o: any) => { o.renderOrder = order })

const safeColor = (str: string, fallback: string) => {
  try {
    const c = new THREE.Color()
    c.set((str || '').trim() || fallback)
    return c
  } catch (e) {
    return new THREE.Color(fallback)
  }
}

// Asset path chosen in the Inspector → loadable URL
const resolveAssetUrl = async (path: string): Promise<string | null> => {
  if (!path) return null
  try {
    const asset: any = await (ecs as any).assets.load({url: path})
    return asset.localUrl || asset.remoteUrl || path
  } catch (e) {
    return path
  }
}

// ---------------------------------------------------------------------------
// Door
// ---------------------------------------------------------------------------
const buildDoor = (c: Config) => {
  const W = c.doorWidth
  const H = c.doorHeight
  const g = new THREE.Group()
  const color = safeColor(c.doorColor, '#ff6fa8')
  const frameMat = new THREE.MeshStandardMaterial({color, roughness: 0.45, metalness: 0.05})
  const t = 0.1 * (H / 2.7) + 0.02
  const d = 0.14

  const post = new THREE.BoxGeometry(t, H + t, d)
  const left = new THREE.Mesh(post, frameMat)
  left.position.set(-(W + t) / 2, (H + t) / 2, 0)
  const right = new THREE.Mesh(post, frameMat)
  right.position.set((W + t) / 2, (H + t) / 2, 0)
  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 2 * t, t, d), frameMat)
  top.position.set(0, H + t / 2, 0)
  g.add(left, right, top)

  // Door leaf: hinged on the left, swings open toward the real-world side (+Z)
  const pivot = new THREE.Group()
  pivot.position.set(-W / 2, 0, d / 2)
  const leaf = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, 0.05),
    new THREE.MeshStandardMaterial({color: color.clone().multiplyScalar(1.05), roughness: 0.4})
  )
  leaf.position.set(W / 2, H / 2, 0.025)
  pivot.add(leaf)
  const knobMat = new THREE.MeshStandardMaterial({color: 0xffd34d, metalness: 0.6, roughness: 0.3})
  for (const z of [0.08, -0.03]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), knobMat)
    knob.position.set(W - 0.15, H * 0.48, z)
    pivot.add(knob)
  }
  g.add(pivot)

  // Glow ring on the ground at the doorway
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(W * 0.55, W * 0.72, 48),
    new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide})
  )
  glow.rotation.x = -Math.PI / 2
  glow.position.set(0, 0.005, W * 0.5)
  g.add(glow)

  setRenderOrder(g, RO_REAL)
  return {group: g, pivot}
}

// ---------------------------------------------------------------------------
// Invisible occluders
// ---------------------------------------------------------------------------
// Panorama mode: one huge occluder wall (z = +0.02) with a door-shaped hole
const buildFrontWall = (c: Config) => {
  const g = new THREE.Group()
  const mat = occluderMat()
  const W = 150
  const z = 0.02
  const dw = c.doorWidth
  const dh = c.doorHeight
  const add = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    m.position.set(x, y, z)
    g.add(m)
  }
  const sideW = W - dw / 2
  add(sideW, 2 * W, -(dw / 2 + sideW / 2), 0)
  add(sideW, 2 * W, (dw / 2 + sideW / 2), 0)
  add(dw, W - dh, 0, dh + (W - dh) / 2)
  add(dw, W, 0, -W / 2)
  setRenderOrder(g, RO_OCCLUDER)
  return g
}

// Garden mode: occluder box around the garden, with a door-shaped hole in front
const buildShellBox = (c: Config, size: {w: number, d: number, h: number}) => {
  const g = new THREE.Group()
  const mat = occluderMat()
  const W = size.w / 2 + 1
  const D = size.d + 1
  const H = size.h + 1
  const B = 3
  const zF = 0.02
  const dw = c.doorWidth
  const dh = c.doorHeight
  const add = (w: number, h: number, pos: number[], ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    m.position.set(pos[0], pos[1], pos[2])
    m.rotation.set(rx, ry, 0)
    g.add(m)
  }
  const totalH = H + B
  const midY = (H - B) / 2
  const sideW = W - dw / 2
  add(sideW, totalH, [-(dw / 2 + sideW / 2), midY, zF])
  add(sideW, totalH, [(dw / 2 + sideW / 2), midY, zF])
  add(dw, H - dh, [0, dh + (H - dh) / 2, zF])
  add(dw, B, [0, -B / 2, zF])
  const depth = D + zF
  const midZ = zF - depth / 2
  add(2 * W, totalH, [0, midY, zF - depth])
  add(depth, totalH, [-W, midY, midZ], Math.PI / 2)
  add(depth, totalH, [W, midY, midZ], Math.PI / 2)
  add(2 * W, depth, [0, H, midZ], 0, Math.PI / 2)
  add(2 * W, depth, [0, -B, midZ], 0, Math.PI / 2)
  setRenderOrder(g, RO_OCCLUDER)
  return g
}

// Inside: doorway-sized occluder (z = 0) so the doorway shows the real world
const buildDoorwayHider = (c: Config) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(c.doorWidth, c.doorHeight), occluderMat())
  m.position.set(0, c.doorHeight / 2, 0)
  m.renderOrder = RO_OCCLUDER
  return m
}

// ---------------------------------------------------------------------------
// Other world: sample garden (no assets needed)
// ---------------------------------------------------------------------------
const buildGarden = (s: number) => {
  const size = {w: 28 * s, d: 28 * s, h: 14 * s}
  const g = new THREE.Group()
  const zc = 0.01 - size.d / 2

  const skyGeo = new THREE.BoxGeometry(size.w, size.h + 1, size.d, 1, 12, 1)
  const pos = skyGeo.attributes.position
  const colors = []
  const top = new THREE.Color(0x3a7bd5)
  const horizon = new THREE.Color(0xffd6e8)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const tY = THREE.MathUtils.clamp((pos.getY(i) + (size.h + 1) / 2) / (size.h + 1), 0, 1)
    c.copy(horizon).lerp(top, Math.pow(tY, 0.7))
    colors.push(c.r, c.g, c.b)
  }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide}))
  sky.position.set(0, (size.h + 1) / 2 - 0.5, zc)
  g.add(sky)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size.w, size.d), new THREE.MeshStandardMaterial({color: 0x7ccf6a, roughness: 1}))
  ground.rotation.x = -Math.PI / 2
  ground.position.set(0, 0, zc)
  g.add(ground)
  const path = new THREE.Mesh(new THREE.PlaneGeometry(1.2 * s, size.d - 2), new THREE.MeshStandardMaterial({color: 0xe8d3a8, roughness: 1}))
  path.rotation.x = -Math.PI / 2
  path.position.set(0, 0.005, zc + 1)
  g.add(path)

  const trunkMat = new THREE.MeshStandardMaterial({color: 0x8b5a2b})
  const leafMats = [0x2f9e44, 0x51cf66, 0xff8fb1].map(col => new THREE.MeshStandardMaterial({color: col, flatShading: true}))
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 26; i++) {
    const x = (rand() * 2 - 1) * (size.w / 2 - 1.5)
    const z = -2.5 * s - rand() * (size.d - 4)
    if (Math.abs(x) < 1.6 * s) continue
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8), trunkMat)
    trunk.position.y = 0.4
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 7), leafMats[i % 3])
    crown.position.y = 1.5
    tree.add(trunk, crown)
    tree.position.set(x, 0, z)
    tree.scale.setScalar((0.7 + rand() * 0.9) * s)
    g.add(tree)
  }

  const floaters = []
  const cc = [0x9b5de5, 0x00bbf9, 0xfee440, 0xf15bb5, 0x00f5d4]
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry((0.22 + rand() * 0.15) * s),
      new THREE.MeshStandardMaterial({color: cc[i % 5], emissive: cc[i % 5], emissiveIntensity: 0.35, roughness: 0.2})
    )
    const baseY = (1.2 + rand() * 1.6) * s
    m.position.set((rand() * 2 - 1) * 4 * s, baseY, (-2 - rand() * 9) * s)
    m.userData = {baseY, phase: rand() * Math.PI * 2, speed: 0.6 + rand()}
    g.add(m)
    floaters.push(m)
  }
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 24, 16), new THREE.MeshBasicMaterial({color: 0xfff3b0}))
  sun.position.set(4 * s, 8 * s, -size.d + 2)
  g.add(sun)
  g.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 0.9))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(3, 6, 2)
  g.add(dir)
  return {group: g, floaters, size}
}

// ---------------------------------------------------------------------------
// Other world: 360 panorama
// ---------------------------------------------------------------------------
const loadPanoramaTexture = (url: string): Promise<any> => new Promise((resolve, reject) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    let source: any = img
    if (img.width > MAX_TEXTURE) {
      // Oversized panoramas are shrunk automatically — students don't have to resize
      const canvas = document.createElement('canvas')
      canvas.width = MAX_TEXTURE
      canvas.height = Math.round(MAX_TEXTURE * img.height / img.width)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      source = canvas
    }
    const tex = source === img ? new THREE.Texture(img) : new THREE.CanvasTexture(source)
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
    resolve(tex)
  }
  img.onerror = reject
  img.src = url
})

const buildPanorama = (c: Config) => {
  const geo = new THREE.SphereGeometry(80, 64, 32)
  geo.scale(-1, 1, 1)
  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  const b = THREE.MathUtils.clamp(c.panoramaBrightness || 1, 0.1, 3)
  const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(b, b, b), clippingPlanes: [clip], toneMapped: false, fog: false})
  const mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false
  mesh.visible = false
  return {mesh, clip}
}

const LOCAL_CLIP = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
const updatePanorama = (world: ecs.World, camPos: any) => {
  if (!S.pano) return
  S.pano.visible = S.placed && S.innerWorld.visible
  if (!S.pano.visible) return
  world.three.renderer.localClippingEnabled = true
  S.pano.position.copy(camPos)
  // PANO_CENTER_OFFSET: with rotation 0° the doorway faces the centre of the panorama
  S.pano.rotation.set(0, S.root.rotation.y + THREE.MathUtils.degToRad(PANO_CENTER_OFFSET + (S.cfg.panoramaRotation || 0)), 0)
  if (S.inside) {
    S.panoClip.set(new THREE.Vector3(0, 0, -1), 1e9)
  } else {
    S.root.updateMatrixWorld(true)
    S.panoClip.copy(LOCAL_CLIP).applyMatrix4(S.root.matrixWorld)
  }
}

// ---------------------------------------------------------------------------
// Sound
// ---------------------------------------------------------------------------
const loadSounds = async (c: Config) => {
  const vol = THREE.MathUtils.clamp(c.soundVolume, 0, 1)
  const enterUrl = await resolveAssetUrl(c.enterSound)
  if (enterUrl) {
    S.enterAudio = new Audio(enterUrl)
    S.enterAudio.volume = vol
  }
  const insideUrl = await resolveAssetUrl(c.insideSound)
  if (insideUrl) {
    S.insideAudio = new Audio(insideUrl)
    S.insideAudio.loop = true
    S.insideAudio.volume = vol
  }
}

// Mobile browsers only allow audio after a user tap, so we prime it on the placement tap
const unlockAudio = () => {
  for (const a of [S.enterAudio, S.insideAudio]) {
    if (!a) continue
    const v = a.volume
    a.volume = 0
    a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = v }).catch(() => { a.volume = v })
  }
}

// ---------------------------------------------------------------------------
// On-screen text
// ---------------------------------------------------------------------------
let hintEl: HTMLDivElement | null = null
let resetBtn: HTMLButtonElement | null = null
let toastEl: HTMLDivElement | null = null
let debugEl: HTMLDivElement | null = null
let toastTimer = 0

const buildUi = (onReset: () => void) => {
  const style = document.createElement('style')
  style.textContent = `
    .pd-hint{position:fixed;left:50%;bottom:calc(28px + env(safe-area-inset-bottom));transform:translateX(-50%);
      z-index:10;max-width:88vw;padding:10px 16px;border-radius:20px;background:rgba(0,0,0,.55);color:#fff;text-align:center;
      font:600 15px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;pointer-events:none;transition:opacity .3s}
    .pd-reset{position:fixed;right:16px;top:calc(16px + env(safe-area-inset-top));z-index:10;padding:8px 14px;border:0;
      border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:600 14px -apple-system,sans-serif;display:none}
    .pd-toast{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:10;padding:10px 16px;border-radius:12px;
      background:rgba(180,30,60,.85);color:#fff;font:600 14px -apple-system,sans-serif;pointer-events:none;opacity:0;transition:opacity .25s}
    .pd-debug{position:fixed;left:8px;top:calc(64px + env(safe-area-inset-top));z-index:11;padding:6px 8px;background:rgba(0,0,0,.6);color:#0f0;
      font:12px/1.5 monospace;white-space:pre;pointer-events:none}`
  document.head.appendChild(style)
  hintEl = document.createElement('div')
  hintEl.className = 'pd-hint'
  document.body.appendChild(hintEl)
  resetBtn = document.createElement('button')
  resetBtn.className = 'pd-reset'
  resetBtn.textContent = 'Reset'
  resetBtn.addEventListener('pointerdown', e => e.stopPropagation())
  resetBtn.addEventListener('click', (e) => { e.stopPropagation(); onReset() })
  document.body.appendChild(resetBtn)
  toastEl = document.createElement('div')
  toastEl.className = 'pd-toast'
  document.body.appendChild(toastEl)
}

const setHint = (msg: string | null) => {
  if (!hintEl) return
  if (msg) hintEl.textContent = msg
  hintEl.style.opacity = msg ? '1' : '0'
}

const toast = (msg: string) => {
  if (!toastEl) return
  toastEl.textContent = msg
  toastEl.style.opacity = '1'
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastEl.style.opacity = '0' }, 1600)
}

const updateDebug = (local: any) => {
  if (!S.cfg.showDebug) return
  if (!debugEl) {
    debugEl = document.createElement('div')
    debugEl.className = 'pd-debug'
    document.body.appendChild(debugEl)
  }
  const half = S.cfg.doorWidth / 2 - S.cfg.doorwayMargin
  debugEl.textContent =
    `Phone position (door = origin)\nx left/right ${local.x.toFixed(2)}   y height ${local.y.toFixed(2)}   z front/back ${local.z.toFixed(2)}\n` +
    `Doorway |x| < ${half.toFixed(2)}   z > 0 in front / z < 0 behind\n` +
    `State: ${S.inside ? 'in the other world' : 'in the real world'}   Other world visible: ${S.innerWorld.visible ? 'yes' : 'no'}`
}

// ---------------------------------------------------------------------------
// Placement and crossing
// ---------------------------------------------------------------------------
const setInside = (inside: boolean) => {
  S.inside = inside
  S.shell.visible = !inside
  S.doorwayHider.visible = inside
  if (inside) {
    setHint(S.cfg.hintInside || null)
    if (S.enterAudio) { S.enterAudio.currentTime = 0; S.enterAudio.play().catch(() => {}) }
    if (S.insideAudio) S.insideAudio.play().catch(() => {})
  } else if (S.insideAudio) {
    S.insideAudio.pause()
  }
}

const passedThroughDoorway = (prev: any, cur: any) => {
  const dx = cur.x - prev.x
  const dy = cur.y - prev.y
  const dz = cur.z - prev.z
  if (Math.sqrt(dx * dx + dy * dy + dz * dz) > MAX_STEP) return false
  const t = prev.z / (prev.z - cur.z)
  const x = prev.x + dx * t
  const y = prev.y + dy * t
  return Math.abs(x) < S.cfg.doorWidth / 2 - S.cfg.doorwayMargin && y > 0
}

const raycastGround = (world: ecs.World, clientX: number, clientY: number) => {
  const rect = world.three.renderer.domElement.getBoundingClientRect()
  const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
  const cam = world.three.activeCamera
  cam.updateMatrixWorld(true)
  const rc = new THREE.Raycaster()
  rc.setFromCamera(ndc, cam)
  if (rc.ray.direction.y > -0.05) return null
  const hit = new THREE.Vector3()
  if (!rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return null
  if (hit.distanceTo(rc.ray.origin) > S.cfg.maxPlaceDistance) return null
  return hit
}

const placePortal = (world: ecs.World, point: any) => {
  const camPos = new THREE.Vector3()
  world.three.activeCamera.getWorldPosition(camPos)
  S.root.position.set(point.x, 0, point.z)
  S.root.rotation.set(0, Math.atan2(camPos.x - point.x, camPos.z - point.z), 0)
  S.root.scale.setScalar(0.001)
  S.root.visible = true
  S.root.updateMatrixWorld(true)
  S.placed = true
  S.placeTime = performance.now()
  S.prevLocal = S.root.worldToLocal(camPos.clone())
  setInside(false)
  setHint(S.cfg.hintApproach || null)
  if (resetBtn) resetBtn.style.display = 'block'
}

const resetPortal = () => {
  S.placed = false
  S.root.visible = false
  if (S.pano) S.pano.visible = false
  S.leafPivot.rotation.y = 0
  setInside(false)
  setHint(S.cfg.hintPlace || null)
  if (resetBtn) resetBtn.style.display = 'none'
}

// ---------------------------------------------------------------------------
// Component (everything the Inspector shows is in the schema)
// ---------------------------------------------------------------------------
ecs.registerComponent({
  name: 'portal-door',
  schema: {
    // @label Door | Width (m)
    // @min 0.5
    // @max 4
    doorWidth: ecs.f32,
    // @label Door | Height (m)
    // @min 1
    // @max 6
    doorHeight: ecs.f32,
    // @label Door | Colour
    // @color
    doorColor: ecs.string,
    // @label Door | Open angle (deg)
    // @min 0
    // @max 170
    doorOpenAngle: ecs.f32,

    // @label World | Type
    // @enum panorama, garden
    worldType: ecs.string,
    // @label World | 360 panorama
    // @asset image
    // @condition worldType=panorama
    panoramaImage: ecs.string,
    // @label World | Panorama rotation (deg)
    // @min -180
    // @max 180
    // @condition worldType=panorama
    panoramaRotation: ecs.f32,
    // @label World | Panorama brightness
    // @min 0.2
    // @max 2
    // @condition worldType=panorama
    panoramaBrightness: ecs.f32,

    // @label Sound | Crossing sound effect
    // @asset audio
    enterSound: ecs.string,
    // @label Sound | Other-world ambience (loops)
    // @asset audio
    insideSound: ecs.string,
    // @label Sound | Volume
    // @min 0
    // @max 1
    soundVolume: ecs.f32,

    // @label Text | Before placing
    hintPlace: ecs.string,
    // @label Text | After placing
    hintApproach: ecs.string,
    // @label Text | On entering
    hintInside: ecs.string,
    // @label Text | On returning
    hintBack: ecs.string,

    // @label Advanced | Max placement distance (m)
    // @min 1
    // @max 20
    maxPlaceDistance: ecs.f32,
    // @label Advanced | Doorway margin (m)
    // @min 0
    // @max 0.5
    doorwayMargin: ecs.f32,
    // @label Advanced | Show debug info
    showDebug: ecs.boolean,
  },
  schemaDefaults: {
    doorWidth: 1.3,
    doorHeight: 2.7,
    doorColor: '#ff6fa8',
    doorOpenAngle: 105,
    worldType: 'panorama',
    panoramaImage: '',
    panoramaRotation: 0,
    panoramaBrightness: 1,
    enterSound: '',
    insideSound: '',
    soundVolume: 0.8,
    hintPlace: 'Point your phone at the floor and tap to place the door',
    hintApproach: 'Walk up to the door, look through it — then step inside',
    hintInside: 'Turn around and look back at the real world',
    hintBack: 'Welcome back to the real world',
    maxPlaceDistance: 8,
    doorwayMargin: 0.15,
    showDebug: false,
  },

  add: (world, component) => {
    if (!THREE) {
      console.error('[portal-door] THREE not found')
      return
    }
    if (S.root) {
      console.warn('[portal-door] Only one portal-door per scene; extra ones are ignored')
      return
    }
    const p: any = component.schema
    const cfg: Config = {
      doorWidth: p.doorWidth > 0 ? p.doorWidth : 1.3,
      doorHeight: p.doorHeight > 0 ? p.doorHeight : 2.7,
      doorColor: p.doorColor,
      doorOpenAngle: p.doorOpenAngle,
      worldType: p.worldType === 'garden' ? 'garden' : 'panorama',
      panorama: p.panoramaImage,
      panoramaRotation: p.panoramaRotation,
      panoramaBrightness: p.panoramaBrightness > 0 ? p.panoramaBrightness : 1,
      enterSound: p.enterSound,
      insideSound: p.insideSound,
      soundVolume: p.soundVolume,
      hintPlace: p.hintPlace,
      hintApproach: p.hintApproach,
      hintInside: p.hintInside,
      hintBack: p.hintBack,
      maxPlaceDistance: p.maxPlaceDistance > 0 ? p.maxPlaceDistance : 8,
      doorwayMargin: Math.max(0, Math.min(p.doorwayMargin, p.doorWidth / 2 - 0.05)),
      showDebug: !!p.showDebug || /[?&]debug=1/.test(window.location.search),
    }
    // Panorama mode but no image chosen → fall back to the sample garden
    let usePano = cfg.worldType === 'panorama' && !!cfg.panorama
    S.cfg = cfg

    world.three.setMatrixUpdateMode('auto')
    const root = new THREE.Group()
    root.name = 'PortalDoor'
    root.visible = false

    const door = buildDoor(cfg)
    const hider = buildDoorwayHider(cfg)
    let inner: any
    let shell: any
    if (usePano) {
      inner = {group: new THREE.Group(), floaters: []}
      shell = buildFrontWall(cfg)
      const pano = buildPanorama(cfg)
      world.three.scene.add(pano.mesh)
      S.pano = pano.mesh
      S.panoClip = pano.clip
      resolveAssetUrl(cfg.panorama)
        .then(url => loadPanoramaTexture(url))
        .then((tex) => { S.pano.material.map = tex; S.pano.material.needsUpdate = true })
        .catch(() => toast('Could not load the panorama — check the file'))
    } else {
      inner = buildGarden(cfg.doorHeight / 2.1)
      shell = buildShellBox(cfg, inner.size)
    }
    root.add(shell, hider, door.group, inner.group)
    world.three.scene.add(root)

    S.root = root
    S.shell = shell
    S.doorwayHider = hider
    S.innerWorld = inner.group
    S.leafPivot = door.pivot
    S.floaters = inner.floaters
    setInside(false)
    loadSounds(cfg)

    buildUi(resetPortal)
    setHint(cfg.hintPlace || null)
    if (cfg.worldType === 'panorama' && !cfg.panorama) {
      setTimeout(() => toast('No panorama selected yet — showing the sample garden'), 600)
    }

    // Instructor debugging hook
    ;(window as any).__portal = {state: S, setInside, placePortal: (pt: any) => placePortal(world, pt), reset: resetPortal}

    world.three.renderer.domElement.addEventListener('pointerdown', (e: PointerEvent) => {
      if (S.placed) return
      const hit = raycastGround(world, e.clientX, e.clientY)
      if (!hit) {
        toast('Tap on the floor')
        return
      }
      unlockAudio()
      placePortal(world, hit)
    })
  },

  tick: (world) => {
    if (!S.placed || !S.root) return
    const now = performance.now()
    const t = (now - S.placeTime) / 1000

    // Intro animation: grow → swing open
    const grow = Math.min(t / 0.5, 1)
    S.root.scale.setScalar(1 - Math.pow(1 - grow, 3) + 0.001)
    const open = THREE.MathUtils.clamp((t - 0.6) / 1.2, 0, 1)
    S.leafPivot.rotation.y = -(1 - Math.pow(1 - open, 3)) * THREE.MathUtils.degToRad(S.cfg.doorOpenAngle)

    for (const f of S.floaters) {
      const {baseY, phase, speed} = f.userData
      f.position.y = baseY + Math.sin(now / 1000 * speed + phase) * 0.15
      f.rotation.y += 0.01 * speed
    }

    // Crossing test
    const camPos = new THREE.Vector3()
    world.three.activeCamera.getWorldPosition(camPos)
    const local = S.root.worldToLocal(camPos.clone())
    const prev = S.prevLocal
    if (prev) {
      const crossedIn = prev.z >= 0 && local.z < 0
      const crossedOut = prev.z < 0 && local.z >= 0
      if (((crossedIn && !S.inside) || (crossedOut && S.inside)) && passedThroughDoorway(prev, local)) {
        setInside(!S.inside)
        if (!S.inside) setHint(S.cfg.hintBack || null)
      }
    }
    S.prevLocal = local.clone()

    // Walked around the side to the back without using the doorway → hide the other world
    S.innerWorld.visible = S.inside || local.z >= 0
    updatePanorama(world, camPos)
    updateDebug(local)
  },
})
