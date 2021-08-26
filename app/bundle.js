const path = require('path')
const config = require('config')
const Bundler = require('parcel-bundler')

async function runBundle (app) {
  const bundler = new Bundler(
    path.join(process.cwd(), '/assets/scripts/main.js'),
    {
      outDir: './build',
      publicUrl: '/assets'
      // scopeHoist: true // Turns on experimental tree-shaking (broken)
    }
  )

  if (config.env === 'production') {
    await bundler.bundle()
  } else {
    if (app) {
      // Also runs .bundle()
      app.use(bundler.middleware())
    } else {
      await bundler.serve()
    }
  }
}

// In production bundle immediately and exit.
if (config.env === 'production') {
  runBundle()
}

module.exports = runBundle
