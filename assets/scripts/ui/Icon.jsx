import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CopyIcon, TrashcanIcon, ToolsIcon } from '@primer/octicons-react'
import {
  ICON_TWITTER,
  ICON_FACEBOOK,
  ICON_GITHUB,
  ICON_DISCORD,
  ICON_PERSON
} from './icons'
import forumsIcon from './icons/forums.svg'
import googleIcon from './icons/google.svg'
import slackIcon from './icons/slack.svg'

const OCTICON_DEFAULT_CLASSNAME = 'octicon'

// Preserve, don't replace default Octicon classname
function octiconClassNames (className) {
  return [OCTICON_DEFAULT_CLASSNAME, className].join(' ').trim()
}

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string
}

function Icon ({ icon, className }) {
  switch (icon) {
    case 'copy':
      return <CopyIcon size={16} className={octiconClassNames(className)} />
    case 'twitter':
      return <FontAwesomeIcon className="menu-item-icon" icon={ICON_TWITTER} />
    case 'facebook':
      return <FontAwesomeIcon className="menu-item-icon" icon={ICON_FACEBOOK} />
    case 'github':
      return <FontAwesomeIcon className="menu-item-icon" icon={ICON_GITHUB} />
    case 'discord':
      return <FontAwesomeIcon className="menu-item-icon" icon={ICON_DISCORD} />
    case 'person':
      return (
        <FontAwesomeIcon icon={ICON_PERSON} className="icon-person" size="md" />
      )
    case 'slack':
      return <img className="menu-item-icon" src={slackIcon} alt="" />
    case 'forums':
      return <img className="menu-item-icon" src={forumsIcon} alt="" />
    case 'google':
      return <img className="menu-item-icon" src={googleIcon} alt="" />
    case 'trash':
      return <TrashcanIcon size={16} className={octiconClassNames(className)} />
    case 'tools':
      return <ToolsIcon size={16} className={octiconClassNames(className)} />
    default:
      // Ancient fallback (should no longer be used)
      return (
        <svg className="menu-item-icon">
          <use xlinkHref={`#icon-${this.props.icon}`} />
        </svg>
      )
  }
}

export default Icon
