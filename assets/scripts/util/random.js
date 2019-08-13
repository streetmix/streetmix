const MAX_RAND_SEED = 999999999

/**
 * Returns a random integer between 0 and MAX_RAND_SEED. This value should
 * always be greater than 0.
 */
export function generateRandSeed () {
  return Math.ceil(Math.random() * MAX_RAND_SEED)
}
