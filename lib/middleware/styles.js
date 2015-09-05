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
var etag = require('etag')

var src = path.join(process.cwd(), 'assets/css/styles.scss')

var plugins = [
  autoprefixer({ browsers: ['last 2 versions', 'IE >= 11'] })
]

var compiledStyles
var etagString

// Precompile
vinylFs.src(src)
  // TODO: Better error handling, don't just fail silently
  .pipe(plumber())
  .pipe(gulpif(config.env !== 'production', sourcemaps.init()))
  .pipe(sass({ outputStyle: 'compressed' }))
  .pipe(postcss(plugins))
  .pipe(gulpif(config.env !== 'production', sourcemaps.write()))
  .pipe(tap(function (file) {
    compiledStyles = file.contents
    etagString = etag(file.contents)
  }))

module.exports = function (req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next()
  }

  // TODO, handle browser cache
  res.writeHead(200, {
    'Content-Type': 'text/css',
    'ETag': etagString,
    'Cache-Control': 'public, max-age=15768000'
  })
  res.end(compiledStyles)
}
