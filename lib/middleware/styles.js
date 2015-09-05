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

var cssMiddleware = module.exports = function (req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next()
  }

  // If you're not looking for styles.css, move on
  if (req.originalUrl !== '/assets/css/styles.css') {
    return next()
  }

  var src = path.join(process.cwd(), 'assets/css/styles.scss')

  var plugins = [
    autoprefixer({ browsers: ['last 2 versions', 'IE >= 11'] })
  ]

  var isFileFound = false

  // TODO: Precompile & cache

  vinylFs.src(src)
    // TODO: Better error handling, don't just fail silently
    .pipe(plumber({ errorHandler: next }))
    .pipe(gulpif(config.env !== 'production', sourcemaps.init()))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(postcss(plugins))
    .pipe(gulpif(config.env !== 'production', sourcemaps.write()))
    .pipe(tap(function (file) {
      isFileFound = true
      res.writeHead(200, {
        'Content-Type': 'text/css',
        'ETag': etag(file.contents),
        'Cache-Control': 'public, max-age=15768000'
      })
      res.end(file.contents)
    }))
    .on('end', function () {
      // TODO: Better error handling here too
      if (!isFileFound) {
        next()
      }
    })
}
