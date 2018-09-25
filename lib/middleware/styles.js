'use strict'

const path = require('path')
const config = require('config')
const Bundler = require('parcel-bundler')

// Where the entry point for our stylesheet lives.
const STYLE_SOURCE = '/assets/css/styles.scss'

;(async function () {
  const bundler = new Bundler(path.join(process.cwd(), STYLE_SOURCE), {
    outDir: './build'
  })

  if (config.env === 'production') {
    await bundler.bundle()
  } else {
    // Allow hot-module reloading (HMR) in non-production environments
    // This also runs .bundle()
    // (but we still need to set up the HMR connection somehow... (todo))
    await bundler.serve()
  }
})()
