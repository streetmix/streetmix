import fs from 'node:fs/promises'
import path from 'node:path'
import { load, JSON_SCHEMA } from 'js-yaml'

const srcDir = 'data'
const outDir = 'src/data'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    // Recursive
    if (entry.isDirectory()) await walk(fullPath)
    else if (/\.(ya?ml)$/i.test(entry.name)) {
      // Convert from YAML to JSON
      const yaml = await fs.readFile(fullPath, 'utf8')
      const json = load(yaml, {
        schema: JSON_SCHEMA,
      })

      // Write file
      const rel = path.relative(srcDir, fullPath)
      const outFile = path.join(outDir, rel).replace(/\.(ya?ml)$/i, '.json')

      await fs.mkdir(path.dirname(outFile), { recursive: true })
      await fs.writeFile(outFile, JSON.stringify(json, null, 2))
      console.log(`Generated: ${fullPath} -> ${outFile}`)
    }
  }
}

await walk(srcDir)
