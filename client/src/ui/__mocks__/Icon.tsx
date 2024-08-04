import React from 'react'

interface IconProps {
  name: string
  className?: string
}

function Icon ({
  name,
  className = '',
  ...attrs
}: IconProps): React.ReactElement {
  return (
    <svg
      className={className}
      data-icon={name}
      data-icon-source="test"
      {...attrs}
    />
  )
}

export default Icon
