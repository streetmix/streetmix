import ENVIRONS from './environs.json'

function makeCSSGradientValue (array) {
  // Normalize all values
  const stops = array.map((item) => {
    // If the value is a string, use it as is
    if (typeof item === 'string') {
      return item
    }

    // If the value is an array, turn it into a string
    if (Array.isArray(item)) {
      const [ color, position ] = item

      // Position is recorded as a value between 0 and 1, but is optional
      let percentage
      if (position) {
        percentage = ` ${position * 100}%`
      }

      return color + (percentage || '')
    }
  })

  return `linear-gradient(${stops.join(', ')})`
}

function makeStyleDeclarationReact (env) {
  const style = {}
  if (env.backgroundColor) {
    style.backgroundColor = env.backgroundColor
  }
  if (env.backgroundGradient) {
    style.backgroundImage = makeCSSGradientValue(env.backgroundGradient)
  }
  return style
}

export function getEnvirons (id) {
  const env = ENVIRONS[id]

  return {
    ...env,
    id,
    style: makeStyleDeclarationReact(env)
  }
}

export function getAllEnvirons () {
  const environs = Object.keys(ENVIRONS)

  return environs.map(getEnvirons)
}
