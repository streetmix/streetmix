// Constants
const NUMBER_OF_SNOWFLAKES = 300
const MAX_SNOWFLAKE_SIZE = 2
const MAX_SNOWFLAKE_SPEED = 1
const SNOWFLAKE_COLOR = '#d9d9d9'

// Keep track of snowflakes
const snowflakes: Snowflake[] = []

// canvas and associated context references
let started = false
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let raf: number | null = null
let width = 0
let height = 0
// devicePixelRatio alias (should only be used for rendering, physics shouldn't care)
const dpr = window.devicePixelRatio ?? 1

interface Snowflake {
  x: number
  y: number
  radius: number
  color: string
  speed: number
  sway: number
}

export function init(el: HTMLCanvasElement): void {
  if (!started) {
    started = true
    canvas = el

    resize()
    window.addEventListener('resize', resize)

    ctx = canvas.getContext('2d')

    for (let i = 0; i < NUMBER_OF_SNOWFLAKES; i++) {
      snowflakes.push(createSnowflake())
    }

    animate()
  }
}

function createSnowflake(): Snowflake {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.ceil(Math.random() * MAX_SNOWFLAKE_SIZE),
    color: SNOWFLAKE_COLOR,
    speed: Math.random() * MAX_SNOWFLAKE_SPEED + 0.5,
    sway: Math.random() - 0.25,
  }
}

function drawSnowflake(snowflake: Snowflake): void {
  if (!ctx) return

  ctx.beginPath()
  ctx.arc(
    snowflake.x * dpr,
    snowflake.y * dpr,
    snowflake.radius * dpr,
    0,
    Math.PI * 2
  )
  ctx.fillStyle = snowflake.color
  ctx.fill()
  ctx.closePath()
}

function updateSnowflake(snowflake: Snowflake): void {
  snowflake.y += snowflake.speed
  snowflake.x += snowflake.sway
  if (snowflake.y > height) {
    Object.assign(snowflake, createSnowflake())
  }
}

function animate(): void {
  if (!started) return

  if (ctx) {
    ctx.clearRect(0, 0, width * dpr, height * dpr)
  }

  snowflakes.forEach((snowflake) => {
    updateSnowflake(snowflake)
    drawSnowflake(snowflake)
  })

  raf = window.requestAnimationFrame(animate)
}

export function stop(): void {
  if (raf !== null) {
    window.cancelAnimationFrame(raf)
    raf = null
  }
  if (ctx) {
    ctx.clearRect(0, 0, width * dpr, height * dpr)
  }

  started = false
  snowflakes.length = 0
  window.removeEventListener('resize', resize)
}

function resize(): void {
  if (canvas === null) return

  // resize
  width = canvas.offsetWidth
  height = canvas.offsetHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
}
