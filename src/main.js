import './style.css'
import { ParticleEngine, PRESETS } from './engine.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="layout">
    <div class="canvas-wrap"><canvas id="stage" aria-label="Particle canvas"></canvas></div>
    <aside class="panel">
      <h1>Particle Studio</h1>
      <p class="sub">Vanilla JS · Canvas · requestAnimationFrame</p>
      <div class="preset-row" id="presets"></div>
      <div id="controls"></div>
      <div class="btn-row">
        <button type="button" id="pause">Pause</button>
        <button type="button" class="primary" id="shot">Save PNG</button>
        <button type="button" id="reset">Reset</button>
      </div>
      <p class="stats" id="stats"></p>
    </aside>
  </div>
`

const canvas = document.getElementById('stage')
const engine = new ParticleEngine(canvas)
engine.start()

const controls = [
  { key: 'count', label: 'Particles', min: 20, max: 300, step: 10 },
  { key: 'speed', label: 'Speed', min: 0.2, max: 3, step: 0.1 },
  { key: 'size', label: 'Size', min: 1, max: 6, step: 0.5 },
  { key: 'linkDist', label: 'Link distance', min: 30, max: 160, step: 5 },
  { key: 'linkOpacity', label: 'Link opacity', min: 0, max: 0.5, step: 0.01 },
  { key: 'trail', label: 'Trail fade', min: 0.05, max: 0.4, step: 0.01 },
]

const controlsEl = document.getElementById('controls')
const presetsEl = document.getElementById('presets')

function bindControl({ key, label, min, max, step }) {
  const wrap = document.createElement('div')
  wrap.className = 'control'
  wrap.innerHTML = `
    <label>${label} <output id="out-${key}">${engine.opts[key]}</output></label>
    <input type="range" id="inp-${key}" min="${min}" max="${max}" step="${step}" value="${engine.opts[key]}" />
  `
  controlsEl.appendChild(wrap)
  const inp = wrap.querySelector('input')
  const out = wrap.querySelector('output')
  inp.addEventListener('input', () => {
    const val = step < 1 ? parseFloat(inp.value) : parseInt(inp.value, 10)
    out.textContent = val
    engine.setOptions({ [key]: val })
    if (key === 'count') engine.reset()
  })
}

controls.forEach(bindControl)

// Color + mode
const colorWrap = document.createElement('div')
colorWrap.className = 'control'
colorWrap.innerHTML = `
  <label>Color</label>
  <input type="color" id="color" value="${engine.opts.color}" style="width:100%;height:2rem;margin-top:0.35rem;border:0;background:transparent;cursor:pointer" />
`
controlsEl.appendChild(colorWrap)
colorWrap.querySelector('#color').addEventListener('input', (e) => engine.setOptions({ color: e.target.value }))

const modeWrap = document.createElement('div')
modeWrap.className = 'control'
modeWrap.innerHTML = `
  <label>Mouse mode</label>
  <select id="mode">
    <option value="attract">Attract</option>
    <option value="repel">Repel</option>
    <option value="free">Free drift</option>
  </select>
`
controlsEl.appendChild(modeWrap)
modeWrap.querySelector('#mode').addEventListener('change', (e) => engine.setOptions({ mode: e.target.value }))

Object.entries(PRESETS).forEach(([name, opts]) => {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = name
  btn.addEventListener('click', () => {
    engine.setOptions(opts)
    engine.reset()
    syncUi()
  })
  presetsEl.appendChild(btn)
})

function syncUi() {
  controls.forEach(({ key, step }) => {
    const inp = document.getElementById(`inp-${key}`)
    const out = document.getElementById(`out-${key}`)
    if (inp) { inp.value = engine.opts[key]; out.textContent = engine.opts[key] }
  })
  document.getElementById('color').value = engine.opts.color
  document.getElementById('mode').value = engine.opts.mode
}

let paused = false
document.getElementById('pause').addEventListener('click', (e) => {
  paused = !paused
  if (paused) { engine.stop(); e.target.textContent = 'Play' }
  else { engine.start(); e.target.textContent = 'Pause' }
})

document.getElementById('reset').addEventListener('click', () => engine.reset())

document.getElementById('shot').addEventListener('click', () => {
  const a = document.createElement('a')
  a.href = engine.snapshot()
  a.download = `particle-studio-${Date.now()}.png`
  a.click()
})

const stats = document.getElementById('stats')
setInterval(() => {
  stats.textContent = `${engine.particles.length} particles · ${engine.w | 0}×${engine.h | 0}px · ${paused ? 'paused' : 'running'}`
}, 500)
