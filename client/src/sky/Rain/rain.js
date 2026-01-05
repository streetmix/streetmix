// Falling rain simulation using 2D canvas
// - vanilla JS, no frameworks
// - framerate independent physics
// - slow-mo / fast-forward support via demo.speed
// - supports high-DPI screens
// - falling rain particles are drawn as vector lines
// - splash particles are lazily pre-rendered so gradients aren't computed each frame
// - all particles make use of object pooling to further boost performance

// initialize
document.addEventListener('DOMContentLoaded', function () {
  // demo.init();
  window.addEventListener('resize', demo.resize)
})

// demo namespace
export const demo = {
  // CUSTOMIZABLE PROPERTIES
  // - physics speed multiplier: allows slowing down or speeding up simulation
  speed: 1,
  // - color of particles
  // color: {
  //   r: "224",
  //   g: "224",
  //   b: "224",
  //   a: "0.33",
  // },
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
  canvas: null,
  ctx: null,
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
  rain_color: null,
  rain_color_clear: null,
  // rain particles
  rain: [],
  rain_pool: [],
  // rain droplet (splash) particles
  drops: [],
  drop_pool: [],
}

// demo initialization (should only run once)
demo.init = function () {
  if (!demo.started) {
    demo.started = true
    demo.canvas = document.getElementById('rain-canvas')
    demo.ctx = demo.canvas.getContext('2d')
    var c = demo.color
    demo.rain_color = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
    demo.rain_color_clear = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)'
    demo.resize()
    Ticker.addListener(demo.step)

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
  // localize common references
  var rain = demo.rain
  var drops = demo.drops
  // recycle particles
  for (let i = rain.length - 1; i >= 0; i--) {
    rain.pop().recycle()
  }
  for (let i = drops.length - 1; i >= 0; i--) {
    drops.pop().recycle()
  }
  // resize
  demo.width = this.canvas.offsetWidth
  demo.height = this.canvas.offsetHeight
  demo.canvas.width = demo.width * demo.dpr
  demo.canvas.height = demo.height * demo.dpr
}

demo.step = function (time, lag) {
  // localize common references
  // var demo = window.demo;
  var speed = demo.speed
  var width = demo.width
  var height = demo.height
  var wind = demo.wind
  var rain = demo.rain
  var rain_pool = demo.rain_pool
  var drops = demo.drops
  var drop_pool = demo.drop_pool

  // multiplier for physics
  var multiplier = speed * lag

  // spawn drops
  demo.drop_time += time * speed
  while (demo.drop_time > demo.drop_delay) {
    demo.drop_time -= demo.drop_delay
    var new_rain = rain_pool.pop() || new Rain()
    new_rain.init()
    var wind_expand = Math.abs((height / new_rain.speed) * wind) // expand spawn width as wind increases
    var spawn_x = Math.random() * (width + wind_expand)
    if (wind > 0) spawn_x -= wind_expand
    new_rain.x = spawn_x
    rain.push(new_rain)
  }

  // rain physics
  for (let i = rain.length - 1; i >= 0; i--) {
    var r = rain[i]
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
  var drop_max_speed = Drop.max_speed
  for (let i = drops.length - 1; i >= 0; i--) {
    var d = drops[i]
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
  // localize common references
  // var demo = window.demo;
  var width = demo.width
  var height = demo.height
  var dpr = demo.dpr
  var rain = demo.rain
  var drops = demo.drops
  var ctx = demo.ctx

  // start fresh
  ctx.clearRect(0, 0, width * dpr, height * dpr)

  // draw rain (trace all paths first, then stroke once)
  ctx.beginPath()
  var rain_height = Rain.height * dpr
  for (let i = rain.length - 1; i >= 0; i--) {
    var r = rain[i]
    var real_x = r.x * dpr
    var real_y = r.y * dpr
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

// Rain definition
function Rain() {
  this.x = 0
  this.y = 0
  this.z = 0
  this.speed = 25
  this.splashed = false
}
Rain.width = 2
Rain.height = 40
Rain.prototype.init = function () {
  this.y = Math.random() * -100
  this.z = Math.random() * 0.5 + 0.5
  this.splashed = false
}
Rain.prototype.recycle = function () {
  demo.rain_pool.push(this)
}
// recycle rain particle and create a burst of droplets
Rain.prototype.splash = function () {
  if (!this.splashed) {
    this.splashed = true
    var drops = demo.drops
    var drop_pool = demo.drop_pool

    for (var i = 0; i < 16; i++) {
      var drop = drop_pool.pop() || new Drop()
      drops.push(drop)
      drop.init(this.x)
    }
  }
}

// Droplet definition
function Drop() {
  this.x = 0
  this.y = 0
  this.radius = Math.round(Math.random() * 2 + 1) * demo.dpr
  this.speed_x = 0
  this.speed_y = 0
  this.canvas = document.createElement('canvas')
  this.ctx = this.canvas.getContext('2d')

  // render once and cache
  var diameter = this.radius * 2
  this.canvas.width = diameter
  this.canvas.height = diameter

  var grd = this.ctx.createRadialGradient(
    this.radius,
    this.radius,
    1,
    this.radius,
    this.radius,
    this.radius
  )
  grd.addColorStop(0, demo.rain_color)
  grd.addColorStop(1, demo.rain_color_clear)
  this.ctx.fillStyle = grd
  this.ctx.fillRect(0, 0, diameter, diameter)
}

Drop.max_speed = 5

Drop.prototype.init = function (x) {
  this.x = x
  this.y = demo.height
  var angle = Math.random() * Math.PI - Math.PI * 0.5
  var speed = Math.random() * Drop.max_speed
  this.speed_x = Math.sin(angle) * speed
  this.speed_y = -Math.cos(angle) * speed
}
Drop.prototype.recycle = function () {
  demo.drop_pool.push(this)
}

// Frame ticker helper module
var Ticker = (function () {
  var PUBLIC_API = {}

  // public
  // will call function reference repeatedly once registered, passing elapsed time and a lag multiplier as parameters
  PUBLIC_API.addListener = function addListener(fn) {
    if (typeof fn !== 'function')
      throw 'Ticker.addListener() requires a function reference passed in.'

    listeners.push(fn)

    // start frame-loop lazily
    if (!started) {
      started = true
      queueFrame()
    }
  }

  // private
  var started = false
  var last_timestamp = 0
  var listeners = []
  // queue up a new frame (calls frameHandler)
  function queueFrame() {
    if (window.requestAnimationFrame) {
      requestAnimationFrame(frameHandler)
    }
  }
  function frameHandler(timestamp) {
    var frame_time = timestamp - last_timestamp
    last_timestamp = timestamp
    // make sure negative time isn't reported (first frame can be whacky)
    if (frame_time < 0) {
      frame_time = 17
    }
    // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
    else if (frame_time > 68) {
      frame_time = 68
    }

    // fire custom listeners
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i].call(window, frame_time, frame_time / 16.67)
    }

    // always queue another frame
    queueFrame()
  }

  return PUBLIC_API
})()
