import ENVIRONS from './environs.json'

export function makeCSSGradientDeclaration (array) {
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

function makeCSSBackgroundImageDeclaration (url) {
  return `url('${url}') top/cover no-repeat`
}

function makeReactStyleObject (env) {
  const style = {}
  if (env.backgroundColor) {
    style.backgroundColor = env.backgroundColor
  }

  if (env.backgroundGradient) {
    if (env.backgroundImage) {
      const background = []
      background.push(makeCSSGradientDeclaration(env.backgroundGradient))
      background.push(makeCSSBackgroundImageDeclaration(env.backgroundImage))
      style.background = background.join(', ')
    } else {
      style.backgroundImage = makeCSSGradientDeclaration(env.backgroundGradient)
    }
  }

  return style
}

export function makeCanvasGradientStopArray (array) {
  // If the value is a string, wrap it in an array
  const stops = array.map((item) => {
    if (typeof item === 'string') {
      return [item]
    }

    // Otherwise, return the original array, but spread it
    // so that the values are cloned. We don't want later
    // transformations to modify the original values.
    return [...item]
  })

  // If the first item doesn't have a stop, make it 0
  if (typeof stops[0][1] === 'undefined') {
    stops[0][1] = 0
  }

  // If the last item doesn't have a stop, make it 1
  if (typeof stops[stops.length - 1][1] === 'undefined') {
    stops[stops.length - 1][1] = 1
  }

  // Now go through each color stops and fill in missing stops
  let previousStop = stops[0][1]
  for (let i = 0; i < stops.length; i++) {
    if (typeof previousStop !== 'undefined') {
      const stop = stops[i][1]
      if (typeof stop === 'undefined') {
        let n = i
        while (typeof stops[n][1] === 'undefined') {
          n++
        }
        const steps = n - i + 1
        const nextStep = stops[n][1]
        const stepSize = (nextStep - previousStop) / steps
        for (let j = i; j < n; j++) {
          previousStop = stops[j][1] = previousStop + stepSize
        }
      } else {
        previousStop = stop
      }
    }
  }

  return stops
}

export function getEnvirons (id) {
  const env = ENVIRONS[id] || ENVIRONS.default

  return {
    ...env,
    id,
    style: makeReactStyleObject(env)
  }
}

export function getAllEnvirons () {
  const environs = Object.keys(ENVIRONS)

  return environs.map(getEnvirons)
}
