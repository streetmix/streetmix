const MAX_RAND_SEED = 999999999

export function generateRandSeed () {
  const randSeed = 1 + Math.floor(Math.random() * MAX_RAND_SEED) // So it’s not zero
  return randSeed
}

export class RandomGenerator {
  constructor () {
    this.randSeed = 0
  }

  rand () {
    const t32 = 0x100000000
    const constant = 134775813
    const x = (constant * this.randSeed) + 1
    return (this.randSeed = x % t32) / t32
  }

  get seed () {
    return this.randSeed
  }

  set seed (seed) {
    this.randSeed = seed
  }
}
