/** Canvas particle engine — zero dependencies. */
export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.mouse = { x: 0, y: 0, down: false }
    this.running = false
    this.opts = {
      count: 120,
      speed: 1.2,
      size: 2.5,
      linkDist: 90,
      linkOpacity: 0.15,
      color: '#43A047',
      mode: 'attract',
      trail: 0.12,
    }
    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect()
      this.mouse.x = e.clientX - r.left
      this.mouse.y = e.clientY - r.top
    })
    canvas.addEventListener('mousedown', () => { this.mouse.down = true })
    window.addEventListener('mouseup', () => { this.mouse.down = false })
    this.resize()
    this.reset()
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = this.canvas.parentElement.getBoundingClientRect()
    this.w = rect.width
    this.h = rect.height
    this.canvas.width = this.w * dpr
    this.canvas.height = this.h * dpr
    this.canvas.style.width = `${this.w}px`
    this.canvas.style.height = `${this.h}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  reset() {
    this.particles = Array.from({ length: this.opts.count }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * this.opts.speed * 2,
      vy: (Math.random() - 0.5) * this.opts.speed * 2,
    }))
  }

  setOptions(partial) {
    Object.assign(this.opts, partial)
    if (partial.count !== undefined) this.reset()
  }

  tick = () => {
    if (!this.running) return
    const { ctx, w, h, opts, particles, mouse } = this
    ctx.fillStyle = `rgba(5, 6, 8, ${opts.trail})`
    ctx.fillRect(0, 0, w, h)

    for (const p of particles) {
      if (mouse.down || opts.mode !== 'free') {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy) || 1
        const force = opts.mode === 'repel' ? -0.08 : 0.05
        if (dist < 180) {
          p.vx += (dx / dist) * force * opts.speed
          p.vy += (dy / dist) * force * opts.speed
        }
      }
      p.vx *= 0.99
      p.vy *= 0.99
      p.x += p.vx * opts.speed
      p.y += p.vy * opts.speed
      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0
    }

    // links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < opts.linkDist) {
          ctx.strokeStyle = opts.color
          ctx.globalAlpha = opts.linkOpacity * (1 - d / opts.linkDist)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    }

    ctx.fillStyle = opts.color
    for (const p of particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, opts.size, 0, Math.PI * 2)
      ctx.fill()
    }

    this._raf = requestAnimationFrame(this.tick)
  }

  start() {
    if (this.running) return
    this.running = true
    this.tick()
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this._raf)
  }

  snapshot() {
    return this.canvas.toDataURL('image/png')
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this._onResize)
  }
}

export const PRESETS = {
  nebula: { count: 160, speed: 0.8, size: 2, linkDist: 100, linkOpacity: 0.2, color: '#2e7d32', mode: 'attract', trail: 0.15 },
  fireflies: { count: 80, speed: 0.5, size: 3.5, linkDist: 60, linkOpacity: 0.08, color: '#a5d6a7', mode: 'free', trail: 0.25 },
  ocean: { count: 200, speed: 1.5, size: 1.8, linkDist: 70, linkOpacity: 0.12, color: '#43A047', mode: 'attract', trail: 0.1 },
  glitch: { count: 100, speed: 2.5, size: 2, linkDist: 120, linkOpacity: 0.25, color: '#66bb6a', mode: 'repel', trail: 0.08 },
}
