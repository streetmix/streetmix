import { styleText } from 'node:util'

import app from './app.ts'
import { logger } from './app/lib/logger.ts'

app.listen(process.env.PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(
      '[express] ' +
        styleText(['yellow', 'bold'], 'Streetmix is starting! ') +
        styleText(['white', 'bold'], 'Go here in your browser: ') +
        styleText(['green', 'bold'], `http://localhost:${process.env.PORT}`)
    )
  } else {
    logger.info(
      '[express]',
      styleText(['yellow', 'bold'], 'Streetmix is starting!')
    )
  }

  if (process.env.OFFLINE_MODE === 'true') {
    logger.info(
      '[express] ' +
        styleText(['cyan', 'bold'], 'Offline mode is ') +
        styleText(['green', 'bold'], 'ON') +
        styleText(['cyan', 'bold'], '.')
    )
  }
})
