import React from 'react'

interface IconProps {
  name: string

  // All other props
  [attr: string]: string
}

function Icon ({ name, ...attrs }: IconProps): React.ReactElement {
  return <svg data-icon={name} data-icon-source="test" {...attrs} />
}

export default Icon
