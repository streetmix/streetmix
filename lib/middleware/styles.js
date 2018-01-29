'use strict'

const config = require('config')
const path = require('path')
const vfs = require('vinyl-fs')
const plumber = require('gulp-plumber')
const gulpif = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const cssimport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const tap = require('gulp-tap')
const logger = require('../logger')()

// Where the entry point for our stylesheet lives.
const STYLE_SOURCE = '/assets/css/styles.scss'

// Plugins that rely on `browserslist` configuration will find it in package.json.
const plugins = [
  cssimport,
  autoprefixer,
  cssnano
]

let compiledStyles

// Express app handles gzip compression, don't do it here.
function compileStyles () {
  vfs.src(path.join(process.cwd(), STYLE_SOURCE))
    .pipe(plumber({ errorHandler: logger.error }))
    .pipe(gulpif(config.env !== 'production', sourcemaps.init()))
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(gulpif(config.env !== 'production', sourcemaps.write()))
    .pipe(tap(function (file) {
      compiledStyles = file.contents
    }))
}

// Precompile
compileStyles()

// Export compile function for watcher
exports.compile = compileStyles

exports.get = function (req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next()
  }

  if (req.fresh) {
    res.status(304).send()
  } else {
    // Note: Express will handle the ETag.
    res.set({
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=31536000'
    })
    res.status(200).send(compiledStyles)
  }
}
