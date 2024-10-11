// Importing * instead of `import { nanoid }` is a workaround to force Parcel
// not to tree-shake this library, which can lead to build failures
import * as nanoid from 'nanoid'

// Returns a random string for seeding.
export function generateRandSeed (): string {
  return nanoid.nanoid()
}
