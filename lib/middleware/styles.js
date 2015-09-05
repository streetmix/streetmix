'use strict'

var config = require('config')
var path = require('path')
var vinylFs = require('vinyl-fs')
var plumber = require('gulp-plumber')
var gulpif = require('gulp-if')
var sourcemaps = require('gulp-sourcemaps')
var sass = require('gulp-sass')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var tap = require('gulp-tap')
var logger = require('../logger')()

var src = path.join(process.cwd(), 'assets/css/styles.scss')

var plugins = [
  autoprefixer({ browsers: ['last 2 versions', 'IE >= 11'] })
]

var compiledStyles

// Precompile
vinylFs.src(src)
  .pipe(plumber({ errorHandler: errorHandler }))
  .pipe(gulpif(config.env !== 'production', sourcemaps.init()))
  .pipe(sass({ outputStyle: 'compressed' }))
  .pipe(postcss(plugins))
  .pipe(gulpif(config.env !== 'production', sourcemaps.write()))
  .pipe(tap(function (file) {
    compiledStyles = file.contents
  }))

function errorHandler (msg) {
  logger.error(msg)
}

module.exports = function (req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next()
  }

  if (req.fresh) {
    res.status(304).send()
  } else {
    res.set({
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=31536000'
    })
    res.status(200).send(compiledStyles)
  }
}
