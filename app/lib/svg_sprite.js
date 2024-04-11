import fs from 'node:fs'
import path from 'node:path'
import glob from 'glob'
import Vinyl from 'vinyl'
import SVGSpriter from 'svg-sprite'
import chalk from 'chalk'
import logger from './logger.js'

/**
 * Compile SVG sprites into a single .svg file with <symbol>s in the project
 * build folder.
 *
 * @param {String} source - source path to find svgs in
 * @param {String} filename - destination filename, without .svg extension
 * @param {String} namespace - prefix to be used to namespace ids
 */
export function compileSVGSprites (source, filename, namespace) {
  // glob pattern to be matched (see `glob` syntax)
  const pattern = path.join(source, '/**/*.svg')

  // svg-sprite configuration object
  const config = {
    dest: 'build/',
    log: 'info',
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
        '[svg-sprite] ' +
          chalk.redBright.bold('✗ ') +
          chalk.red(`Error reading SVG files: ${error}`)
      )
    }

    logger.info(
      '[svg-sprite] ' +
        chalk.cyan('Compiling SVG sprites from ') +
        chalk.gray(source) +
        chalk.cyan('...')
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
    })

    spriter.compile(function (error, result, data) {
      if (error) {
        logger.error(
          '[svg-sprite] ' +
            chalk.redBright.bold('✗ ') +
            chalk.red(`Error compiling SVG sprites: ${error}`)
        )
      }

      for (const mode in result) {
        for (const resource in result[mode]) {
          const sprites = result[mode][resource]

          try {
            // Get just the destination directory
            const spriteDest = path.parse(sprites.path).dir

            // Create the directory if it doesn't exist
            const buildPath = new URL(spriteDest, import.meta.url)
            const createDir = fs.mkdirSync(buildPath, { recursive: true })

            if (createDir) {
              logger.info(
                '[svg-sprite] ' +
                  chalk.yellowBright.bold('! ') +
                  chalk.yellow(`Created directory: ${createDir}`)
              )
            }
          } catch (err) {
            logger.error(
              '[svg-sprite] ' +
                chalk.redBright.bold('✗ ') +
                chalk.red(err.message)
            )
          }

          // Write sprites content
          fs.writeFileSync(sprites.path, sprites.contents)

          // Create shortened version of the path for logging
          const dest = sprites.path.replace(process.cwd(), '.')
          logger.info(
            '[svg-sprite] ' +
              chalk.greenBright.bold('✓ ') +
              chalk.green('SVG sprites written ') +
              '→ ' +
              chalk.gray(dest)
          )
        }
      }
    })
  })
}
