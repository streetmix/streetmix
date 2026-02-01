import { FrameTicker } from '~/src/util/animation.js'
// Falling rain simulation using 2D canvas
// - vanilla JS, no frameworks
// - framerate independent physics
// - slow-mo / fast-forward support via demo.speed
// - supports high-DPI screens
// - falling rain particles are drawn as vector lines
// - splash particles are lazily pre-rendered so gradients aren't computed each frame
// - all particles make use of object pooling to further boost performance
// original by Caleb Miller
// https://codepen.io/MillerTime/pen/oXmgJe

// frame ticker -- this is only instantiated for use here but could be global
const Ticker = new FrameTicker()

// demo namespace
export const demo = {
  // CUSTOMIZABLE PROPERTIES
  // - physics speed multiplier: allows slowing down or speeding up simulation
  speed: 1,
  // - color of particles
  color: {
    r: '128',
    g: '128',
    b: '128',
    a: '0.33',
  },

  // END CUSTOMIZATION
  // whether demo is running
  started: false,
  // canvas and associated context references
  canvas: null, // TODO: type
  ctx: null, // TODO: type
  // viewport dimensions (DIPs)
  width: 0,
  height: 0,
  // devicePixelRatio alias (should only be used for rendering, physics shouldn't care)
  dpr: window.devicePixelRatio ?? 1,
  // time since last drop
  drop_time: 0,
  // ideal time between drops
  drop_delay: 6,
  // wind applied to rain
  wind: 6,
  // color of rain (set in init)
  rain_color: null, // TODO: type `string`
  rain_color_clear: null, // TODO: type `string`
  // rain particles
  rain: [] as Rain[],
  rain_pool: [] as Rain[],
  // rain droplet (splash) particles
  drops: [] as Drop[],
  drop_pool: [] as Drop[],
}

// demo initialization (should only run once)
demo.init = function (el: HTMLCanvasElement) {
  if (!demo.started) {
    demo.started = true
    demo.canvas = el
    demo.ctx = demo.canvas.getContext('2d')

    // initalize some randomness on values
    // TODO -- allow passing in start values as well
    demo.speed = Math.random() * 0.4 + 0.8 // range 0.8 - 1.2
    demo.wind = Math.random() * 20 - 10 // range -10 to 10
    demo.drop_delay = Math.random() * 5 + 3 // range 3 - 8

    const c = demo.color
    demo.rain_color = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
    demo.rain_color_clear = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)'
    demo.resize()

    Ticker.addListener(demo.step)
    window.addEventListener('resize', demo.resize)
    // demo controls
    // lil-gui in global space
    // const gui = new lil.GUI();
    // gui.add(demo, "speed", 0.8, 1.5, 0.01); // orig demo range is 0.2 - 2 but those extremes don't make much sense
    // gui.add(demo, "wind", -25, 25, 0.01);
    // gui.add(demo, "drop_delay", 2, 52); // demo max is 102 but that's too small
  }
}

// (re)size canvas (clears all particles)
demo.resize = function () {
  const { rain, drops } = demo

  // recycle particles
  for (let i = rain.length - 1; i >= 0; i--) {
    rain.pop().recycle()
  }
  for (let i = drops.length - 1; i >= 0; i--) {
    drops.pop().recycle()
  }

  // resize
  demo.width = demo.canvas.offsetWidth
  demo.height = demo.canvas.offsetHeight
  demo.canvas.width = demo.width * demo.dpr
  demo.canvas.height = demo.height * demo.dpr
}

demo.step = function (time: number, lag: number) {
  const { speed, width, height, wind, rain, rain_pool, drops } = demo

  // multiplier for physics
  const multiplier = speed * lag

  // spawn drops
  demo.drop_time += time * speed
  while (demo.drop_time > demo.drop_delay) {
    demo.drop_time -= demo.drop_delay
    const new_rain = rain_pool.pop() || new Rain()
    new_rain.init()
    const wind_expand = Math.abs((height / new_rain.speed) * wind) // expand spawn width as wind increases
    let spawn_x = Math.random() * (width + wind_expand)
    if (wind > 0) spawn_x -= wind_expand
    new_rain.x = spawn_x
    rain.push(new_rain)
  }

  // rain physics
  for (let i = rain.length - 1; i >= 0; i--) {
    const r = rain[i]

    r.y += r.speed * r.z * multiplier
    r.x += r.z * wind * multiplier

    // remove rain when out of view
    if (r.y > height) {
      // if rain reached bottom of view, show a splash
      r.splash()
    }

    // recycle rain
    if (
      r.y > height + Rain.height * r.z ||
      (wind < 0 && r.x < wind) ||
      (wind > 0 && r.x > width + wind)
    ) {
      r.recycle()
      rain.splice(i, 1)
    }
  }

  // splash drop physics
  const drop_max_speed = Drop.max_speed
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]
    d.x += d.speed_x * multiplier
    d.y += d.speed_y * multiplier
    // apply gravity - magic number 0.3 represents a faked gravity constant
    d.speed_y += 0.3 * multiplier
    // apply wind (but scale back the force)
    d.speed_x += (wind / 25) * multiplier
    if (d.speed_x < -drop_max_speed) {
      d.speed_x = -drop_max_speed
    } else if (d.speed_x > drop_max_speed) {
      d.speed_x = drop_max_speed
    }
    // recycle
    if (d.y > height + d.radius) {
      d.recycle()
      drops.splice(i, 1)
    }
  }

  demo.draw()
}

demo.draw = function () {
  const { width, height, dpr, rain, drops, ctx } = demo

  // start fresh
  ctx.clearRect(0, 0, width * dpr, height * dpr)

  // draw rain (trace all paths first, then stroke once)
  ctx.beginPath()
  const rain_height = Rain.height * dpr
  for (let i = rain.length - 1; i >= 0; i--) {
    const r = rain[i]
    const real_x = r.x * dpr
    const real_y = r.y * dpr
    ctx.moveTo(real_x, real_y)
    // magic number 1.5 compensates for lack of trig in drawing angled rain
    ctx.lineTo(real_x - demo.wind * r.z * dpr * 1.5, real_y - rain_height * r.z)
  }
  ctx.lineWidth = Rain.width * dpr
  ctx.strokeStyle = demo.rain_color
  ctx.stroke()

  // draw splash drops (just copy pre-rendered canvas)
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]
    const real_x = d.x * dpr - d.radius
    const real_y = d.y * dpr - d.radius
    ctx.drawImage(d.canvas, real_x, real_y)
  }
}

demo.stop = function () {
  const { width, height, dpr, ctx } = demo

  // clear canvas
  if (ctx) {
    ctx.clearRect(0, 0, width * dpr, height * dpr)
  }

  demo.started = false

  Ticker.clearListeners()
  window.removeEventListener('resize', demo.resize)
}

// Rain definition
class Rain {
  static width = 2
  static height = 40

  x = 0
  y = 0
  z = 0
  speed = 25
  splashed = false

  init() {
    this.y = Math.random() * -100
    this.z = Math.random() * 0.5 + 0.5
    this.splashed = false
  }

  recycle() {
    demo.rain_pool.push(this)
  }

  // recycle rain particle and create a burst of droplets
  splash() {
    if (!this.splashed) {
      this.splashed = true
      const drops = demo.drops
      const drop_pool = demo.drop_pool

      for (let i = 0; i < 16; i++) {
        const drop = drop_pool.pop() ?? new Drop()
        drops.push(drop)
        drop.init(this.x)
      }
    }
  }
}

// Droplet definition
class Drop {
  static max_speed = 5

  x = 0
  y = 0
  radius = Math.round(Math.random() * 2 + 1) * demo.dpr
  speed_x = 0
  speed_y = 0
  canvas = document.createElement('canvas')
  ctx = this.canvas.getContext('2d')

  constructor() {
    if (this.ctx === null) {
      throw new Error('Rain canvas could not be created')
    }

    // render once and cache
    const diameter = this.radius * 2
    this.canvas.width = diameter
    this.canvas.height = diameter

    const gradient = this.ctx.createRadialGradient(
      this.radius,
      this.radius,
      1,
      this.radius,
      this.radius,
      this.radius
    )
    gradient.addColorStop(0, demo.rain_color)
    gradient.addColorStop(1, demo.rain_color_clear)
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, diameter, diameter)
  }

  init(x: number) {
    this.x = x
    this.y = demo.height

    const angle = Math.random() * Math.PI - Math.PI * 0.5
    const speed = Math.random() * Drop.max_speed

    this.speed_x = Math.sin(angle) * speed
    this.speed_y = -Math.cos(angle) * speed
  }

  recycle() {
    demo.drop_pool.push(this)
  }
}
