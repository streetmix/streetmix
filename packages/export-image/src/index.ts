import { makeStreetImage } from './image.js'

import type { Street } from '@streetmix/types'

export async function runTestCanvas (street: Street): Promise<Buffer> {
  const image = await makeStreetImage(street)

  return image
}
