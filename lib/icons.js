const fs = require('fs')
const path = require('path')
const glob = require('glob')
const mkdirp = require('mkdirp')
const SVGSpriter = require('svg-sprite')
const chalk = require('chalk')
const logger = require('./logger.js')()

// svg-sprite configuration object
const config = {
  dest: 'build/',
  // Logger formatting is broken.
  // This is the pull request to fix it:
  // https://github.com/jkphl/svg-sprite/pull/291
  // log: 'info',
  shape: {
    id: {
      // SVGs are created with an `id` attribute so that it can
      // be accessed in HTML with `xlinkHref`
      generator: 'icon-%s'
    }
  },
  mode: {
    // Create a single SVG with symbols
    symbol: {
      dest: '.',
      sprite: 'icons',
      inline: true
    }
  }
}

function compileSVGIcons () {
  // Inititalize svg-sprite
  const spriter = new SVGSpriter(config)

  // Read all individual SVG files, using`glob` to make it easier to grab *.svg
  // svg-sprite parses and optimizes each one, then compiles it
  // Then we pass output back to node `fs` to save it to system
  glob.glob('assets/images/icons/*.svg', function (error, files) {
    if (error) {
      logger.error(
        chalk`[glob] {red.bold ✗} {red Error reading SVG files: ${error}}`
      )
    }

    logger.info(chalk`[svg-sprite] {cyan Compiling SVG icons ...}`)

    files.forEach(function (file) {
      spriter.add(
        path.join(process.cwd(), file),
        // Path basename is what we use for the `id`, so file naming is important
        path.basename(file),
        fs.readFileSync(path.join(process.cwd(), file))
      )
    })

    spriter.compile(function (error, result, data) {
      if (error) {
        logger.error(
          chalk`[svg-sprite] {red.bold ✗} {red Error compiling SVG files: ${error}}`
        )
      }

      for (const mode in result) {
        for (const resource in result[mode]) {
          mkdirp.sync(path.dirname(result[mode][resource].path))
          fs.writeFileSync(
            result[mode][resource].path,
            result[mode][resource].contents
          )
          logger.info(
            chalk`[svg-sprite] {green.bold ✓} {cyan SVG icon bundle written} → {gray ${result[
              mode
            ][resource].path.replace(process.cwd(), '.')}}`
          )
        }
      }
    })
  })
}

module.exports = compileSVGIcons
