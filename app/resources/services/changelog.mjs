import * as fs from 'node:fs/promises'
import logger from '../../lib/logger.js'

const flagFile = `${process.cwd()}/docs/docs/user-guide/changelog.md`

async function getFileContent (res) {
  try {
    return await fs.readFile(flagFile, 'utf8')
  } catch (err) {
    logger.error(err)

    if (err.code === 'ENOENT') {
      res.status(404).json({ status: 404, msg: 'Changelog not found.' })
    } else {
      res
        .status(500)
        .json({ status: 500, msg: 'Could not retrieve changelog.' })
    }
  }
}

function sendSuccessResponse (res, content) {
  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    Location: '/services/changelog'
  })

  const mdContent = content.split('---\n')[2]

  if (!mdContent) {
    res.status(500).json({ status: 500, msg: 'Could not retrieve changelog.' })
    return
  }

  res.status(200).send(mdContent.trim())
}

export async function get (req, res) {
  const content = await getFileContent(res)

  if (content) {
    sendSuccessResponse(res, content)
  }
}
