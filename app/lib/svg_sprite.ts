import fs from 'node:fs/promises'
import path from 'node:path'
import { styleText } from 'node:util'
import { glob } from 'glob'
import Vinyl from 'vinyl'
import SVGSpriter from 'svg-sprite'

import { logger } from './logger.ts'

/**
 * Compile SVG sprites into a single .svg file with <symbol>s in the project
 * build folder.
 *
 * @param source - source path to find svgs in
 * @param filename - destination filename, without .svg extension
 * @param namespace - prefix to be used to namespace ids
 */
export async function compileSVGSprites(
  source: string,
  filename: string,
  namespace: string
) {
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
        generator: `${namespace}-%s`,
      },
    },
    mode: {
      // Create a single SVG with symbols
      symbol: {
        dest: '.',
        sprite: filename,
        inline: true,
      },
    },
  }

  // Initialize svg-sprite
  const spriter = new SVGSpriter(config)

  // Read all individual SVG files, using `glob` to make it easier to grab
  // all svgs at once from the given source directory.
  // The `svg-sprite` package parses and optimizes each svg, then compiles it
  // into a single svg sprite file where each svg is converted to a <symbol>
  // Finally, we pass its output back to node `fs` to save it to the
  // build directory.
  try {
    const files = await glob(pattern)

    logger.info(
      '[svg-sprite] ' +
        styleText('cyan', 'Compiling SVG sprites from ') +
        styleText('gray', source) +
        styleText('cyan', '...')
    )

    await Promise.all(
      files.map(async (file) => {
        const contents = await fs.readFile(path.join(process.cwd(), file))

        // When adding SVG to the spriter, use a Vinyl file object to preserve
        // subdirectory paths in the symbol `id`. This mimics the behavior of
        // the @streetmix/illustrations package. (Without Vinyl, `svg-sprite`
        // will complain if the symbol name does not match a part of the relative
        // file path, which happens when the `/` is converted to `--`.)
        const svg = new Vinyl({
          base: path.join(process.cwd(), source),
          path: path.join(process.cwd(), file),
          contents,
        })

        spriter.add(svg)
      })
    )

    try {
      const { result } = await spriter.compileAsync()

      for (const mode in result) {
        for (const resource in result[mode]) {
          const sprites = result[mode][resource]

          try {
            // Get just the destination directory
            const spriteDest = path.parse(sprites.path).dir

            // Create the directory if it doesn't exist
            const buildPath = new URL(spriteDest, import.meta.url)
            const createDir = await fs.mkdir(buildPath, { recursive: true })

            if (createDir) {
              logger.info(
                '[svg-sprite] ' +
                  styleText(['yellow', 'bold'], '! ') +
                  styleText('yellow', `Created directory: ${createDir}`)
              )
            }
          } catch (err) {
            if (err instanceof Error) {
              logger.error(
                '[svg-sprite] ' +
                  styleText(['red', 'bold'], '✗ ') +
                  styleText('red', err.message)
              )
            } else {
              // Unknown error type
              console.error(err)
            }
          }

          // Write sprites content
          await fs.writeFile(sprites.path, sprites.contents)

          // Create shortened version of the path for logging
          const dest = sprites.path.replace(process.cwd(), '.')
          logger.info(
            '[svg-sprite] ' +
              styleText(['green', 'bold'], '✓ ') +
              styleText('green', 'SVG sprites written ') +
              '→ ' +
              styleText('gray', dest)
          )
        }
      }
    } catch (error) {
      logger.error(
        '[svg-sprite] ' +
          styleText(['red', 'bold'], '✗ ') +
          styleText('red', `Error compiling SVG sprites: ${error}`)
      )
    }
  } catch (error) {
    logger.error(
      '[svg-sprite] ' +
        styleText(['red', 'bold'], '✗ ') +
        styleText('red', `Error reading SVG files: ${error}`)
    )
  }
}
