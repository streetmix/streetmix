import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DuplicateIcon,
  TrashIcon,
  ToolsIcon,
  SunIcon
} from '@primer/octicons-react'
import {
  ICON_DISCORD,
  ICON_FACEBOOK,
  ICON_GITHUB,
  ICON_INSTAGRAM,
  ICON_MASTODON,
  ICON_TWITTER,
  ICON_BOOK
} from './icons'
import forumsIcon from './icons/forums.svg'
import googleIcon from './icons/google.svg'
import slackIcon from './icons/slack.svg'

interface IconProps {
  icon:
  | 'copy'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'mastodon'
  | 'twitter'
  | 'book'
  | 'slack'
  | 'forums'
  | 'google'
  | 'trash'
  | 'tools'
  | 'sun'
  className?: string
}

const OCTICON_DEFAULT_CLASSNAME = 'octicon'

// Preserve, don't replace default Octicon classname
function octiconClassNames (className: string): string {
  return [OCTICON_DEFAULT_CLASSNAME, className].join(' ').trim()
}

function Icon ({ icon, className = '' }: IconProps): React.ReactElement | null {
  switch (icon) {
    case 'copy':
      return (
        <DuplicateIcon size={16} className={octiconClassNames(className)} />
      )
    case 'discord':
      return <FontAwesomeIcon className={className} icon={ICON_DISCORD} />
    case 'facebook':
      return <FontAwesomeIcon className={className} icon={ICON_FACEBOOK} />
    case 'github':
      return <FontAwesomeIcon className={className} icon={ICON_GITHUB} />
    case 'instagram':
      return <FontAwesomeIcon className={className} icon={ICON_INSTAGRAM} />
    case 'mastodon':
      return <FontAwesomeIcon className={className} icon={ICON_MASTODON} />
    case 'twitter':
      return <FontAwesomeIcon className={className} icon={ICON_TWITTER} />
    case 'book':
      return <FontAwesomeIcon className={className} icon={ICON_BOOK} />
    case 'slack': // Deprecated
      return <img className={className} src={slackIcon} alt="" />
    case 'forums': // Deprecated
      return <img className={className} src={forumsIcon} alt="" />
    case 'google':
      return <img className={className} src={googleIcon} alt="" />
    case 'trash':
      return <TrashIcon size={16} className={octiconClassNames(className)} />
    case 'tools':
      return <ToolsIcon size={16} className={octiconClassNames(className)} />
    case 'sun':
      return <SunIcon size={16} className={octiconClassNames(className)} />
    // default:
    //   // You TypeScript
    //   // Ancient fallback (should no longer be used)
    //   return null
  }
}

export default Icon
