'use strict'

var config = require('config')
var path = require('path')
var vfs = require('vinyl-fs')
var plumber = require('gulp-plumber')
var gulpif = require('gulp-if')
var sourcemaps = require('gulp-sourcemaps')
var sass = require('gulp-sass')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var tap = require('gulp-tap')
var logger = require('../logger')()

// Where the entry point for our stylesheet lives.
var STYLE_SOURCE = '/assets/css/styles.scss'

var plugins = [
  autoprefixer({ browsers: ['last 2 versions', 'IE >= 11'] })
]

var compiledStyles

// Precompile
// Express app handles gzip compression, don't do it here.
vfs.src(path.join(process.cwd(), STYLE_SOURCE))
  .pipe(plumber({ errorHandler: logger.error }))
  .pipe(gulpif(config.env !== 'production', sourcemaps.init()))
  .pipe(sass({ outputStyle: 'compressed' }))
  .pipe(postcss(plugins))
  .pipe(gulpif(config.env !== 'production', sourcemaps.write()))
  .pipe(tap(function (file) {
    compiledStyles = file.contents
  }))

module.exports = function (req, res, next) {
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
