interface IconProps {
  name: string

  // All other props
  [attr: string]: string
}

function Icon({ name, ...props }: IconProps) {
  return <svg data-icon={name} {...props} />
}

export default Icon
