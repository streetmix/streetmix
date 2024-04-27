import React from 'react'
import './Triangle.scss'

interface Props {
  highlight: boolean
}

function Triangle ({ highlight }: Props): React.ReactElement {
  const triangleClassNames = ['info-bubble-triangle']

  if (highlight) {
    triangleClassNames.push('info-bubble-triangle-highlight')
  }

  return <div className={triangleClassNames.join(' ')} />
}

export default Triangle
