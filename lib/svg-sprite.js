const fs = require('fs')
const path = require('path')
const glob = require('glob')
const mkdirp = require('mkdirp')
const Vinyl = require('vinyl')
const SVGSpriter = require('svg-sprite')
const chalk = require('chalk')
const logger = require('./logger.js')()

/**
 * Compile SVG sprites into a single .svg file with <symbol>s in the project
 * build folder.
 *
 * @param {String} source - source path to find svgs in
 * @param {String} filename - destination filename, without .svg extension
 * @param {String} namespace - prefix to be used to namespace ids
 */
function compileSVGSprites (source, filename, namespace) {
  // glob pattern to be matched (see `glob` syntax)
  const pattern = path.join(source, '/**/*.svg')

  // svg-sprite configuration object
  const config = {
    dest: 'build/',
    // Logger formatting is broken.
    // This is the pull request to fix it:
    // https://github.com/jkphl/svg-sprite/pull/291
    // log: 'verbose',
    shape: {
      id: {
        // SVGs are created with an `id` attribute so that it can
        // be accessed in HTML with `xlinkHref`
        generator: `${namespace}-%s`
      }
    },
    mode: {
      // Create a single SVG with symbols
      symbol: {
        dest: '.',
        sprite: filename,
        inline: true
      }
    }
  }

  // Inititalize svg-sprite
  const spriter = new SVGSpriter(config)

  // Read all individual SVG files, using `glob` to make it easier to grab
  // all svgs at once from the given source directory.
  // The `svg-sprite` package parses and optimizes each svg, then compiles it
  // into a single svg sprite file where each svg is converted to a <symbol>
  // Finally, we pass its output back to node `fs` to save it to the
  // build directory.
  glob(pattern, function (error, files) {
    if (error) {
      logger.error(
        chalk`[glob] {red.bold ✗} {red Error reading SVG files: ${error}}`
      )
    }

    logger.info(
      chalk`[svg-sprite] {cyan Compiling SVG sprites from} ${source} {cyan ...}`
    )

    files.forEach(function (file) {
      // When adding SVG to the spriter, use a Vinyl file object to preserve
      // subdirectory paths in the symbol `id`. This mimics the behavior of
      // the @streetmix/illustrations package. (Without Vinyl, `svg-sprite`
      // will complain if the symbol name does not match a part of the relative
      // file path, which happens when the `/` is converted to `--`.)
      const svg = new Vinyl({
        base: path.join(process.cwd(), source),
        path: path.join(process.cwd(), file),
        contents: fs.readFileSync(path.join(process.cwd(), file))
      })

      spriter.add(svg)

      // Re-create the symbol `id` that `svg-sprite` will create
      // TODO: Consider removing / refactoring this log when svg-sprite log
      // is fixed
      const id = `${namespace}-${svg.relative
        .replace('/', '--')
        .replace(/.svg$/, '')}`

      logger.verbose(
        chalk`[svg-sprite] {cyan Compiling} {gray ${file.substring(
          source.length
        )}} {cyan as} {white ${id}}`
      )
    })

    spriter.compile(function (error, result, data) {
      if (error) {
        logger.error(
          chalk`[svg-sprite] {red.bold ✗} {red Error compiling SVG sprites: ${error}}`
        )
      }

      for (const mode in result) {
        for (const resource in result[mode]) {
          const sprites = result[mode][resource]
          const dest = sprites.path.replace(process.cwd(), '.')

          mkdirp.sync(path.dirname(sprites.path))
          fs.writeFileSync(sprites.path, sprites.contents)

          logger.info(
            chalk`[svg-sprite] {green.bold ✓} {cyan SVG sprites written} → {gray ${dest}}`
          )
        }
      }
    })
  })
}

module.exports = compileSVGSprites
