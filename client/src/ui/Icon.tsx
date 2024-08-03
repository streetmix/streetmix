import React from 'react'
import { TrashIcon, ToolsIcon, SunIcon } from '@primer/octicons-react'
import {
  FaDiscord,
  FaFacebookSquare,
  FaGithub,
  FaInstagram,
  FaMastodon,
  FaTwitter
} from 'react-icons/fa'
import {
  IoCartOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoMailOutline,
  IoPrintOutline,
  IoRocketOutline,
  IoTrailSignOutline
} from 'react-icons/io5'
import {
  RxClipboardCopy,
  RxCube,
  RxDownload,
  RxExit,
  RxExternalLink,
  RxKeyboard,
  RxLink2,
  RxMixerHorizontal,
  RxStar
} from 'react-icons/rx'

import googleIcon from './icons/google.svg'

interface IconProps {
  name:
  | 'cart'
  | 'copy'
  | 'cube'
  | 'download'
  | 'external-link'
  | 'help'
  | 'info'
  | 'keyboard'
  | 'link'
  | 'mail'
  | 'print'
  | 'rocket'
  | 'trail-sign'
  | 'trash'
  | 'tools'
  | 'settings'
  | 'sign-out'
  | 'star'
  | 'sun'
  // Social
  | 'discord'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'mastodon'
  | 'twitter'
  | 'google'
  className?: string
}

const OCTICON_DEFAULT_CLASSNAME = 'octicon'

// Preserve, don't replace default Octicon classname
function octiconClassNames (className: string): string {
  return [OCTICON_DEFAULT_CLASSNAME, className].join(' ').trim()
}

function Icon ({ name, className = '' }: IconProps): React.ReactElement {
  switch (name) {
    case 'cart':
      return (
        <IoCartOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'copy':
      return (
        <RxClipboardCopy
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'cube':
      return (
        <RxCube
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'discord':
      return (
        <FaDiscord
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'download':
      return (
        <RxDownload
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'external-link':
      return (
        <RxExternalLink
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'facebook':
      return (
        <FaFacebookSquare
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'github':
      return (
        <FaGithub
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'google':
      return <img className={className} src={googleIcon} alt="" />
    case 'help':
      return (
        <IoHelpCircleOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'info':
      return (
        <IoInformationCircleOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'instagram':
      return (
        <FaInstagram
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'keyboard':
      return (
        <RxKeyboard
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'link':
      return (
        <RxLink2
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'mail':
      return (
        <IoMailOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'mastodon':
      return (
        <FaMastodon
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'print':
      return (
        <IoPrintOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'rocket':
      return (
        <IoRocketOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'settings':
      return (
        <RxMixerHorizontal
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'sign-out':
      return (
        <RxExit
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'star':
      return (
        <RxStar
          className={className}
          data-icon={name}
          data-icon-source="radix"
        />
      )
    case 'sun':
      return <SunIcon size={16} className={octiconClassNames(className)} />
    case 'trail-sign':
      return (
        <IoTrailSignOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'trash':
      return <TrashIcon size={16} className={octiconClassNames(className)} />
    case 'tools':
      return <ToolsIcon size={16} className={octiconClassNames(className)} />
    case 'twitter':
      return (
        <FaTwitter
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
  }
}

export default Icon
