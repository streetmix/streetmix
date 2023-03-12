import fs from 'node:fs/promises'
import logger from '../../lib/logger.mjs'

async function readFlags (res) {
  const flagFile = `${process.cwd()}/app/data/flags.json`

  try {
    return await fs.readFile(flagFile, 'utf8')
  } catch (err) {
    logger.error(err)

    if (err.code === 'ENOENT') {
      res.status(404).json({ status: 404, msg: 'No flags found' })
    } else {
      res.status(500).json({ status: 500, msg: 'Could not retrieve flags.' })
    }
  }
}

function sendSuccessResponse (res, flags) {
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    Location: '/api/v1/flags',
    'Cache-Control': 'max-age=86400'
  })

  res.status(200).send(flags)
}

export async function get (req, res) {
  const flags = await readFlags(res)

  if (flags) {
    sendSuccessResponse(res, flags)
  }
}
