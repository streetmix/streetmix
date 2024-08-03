import React from 'react'
import {
  FaDiscord,
  FaSquareFacebook,
  FaGithub,
  FaInstagram,
  FaMastodon,
  FaTwitter
} from 'react-icons/fa6'
import {
  IoCartOutline,
  IoClose,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoMailOutline,
  IoPrintOutline,
  IoRocketOutline,
  IoTrailSignOutline
} from 'react-icons/io5'
import {
  LiaUndoAltSolid,
  LiaRedoAltSolid,
  LiaSun,
  LiaTrashAlt
} from 'react-icons/lia'
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
  | 'close'
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
  | 'redo'
  | 'rocket'
  | 'trail-sign'
  | 'trash'
  | 'settings'
  | 'sign-out'
  | 'star'
  | 'sun'
  | 'undo'
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
    case 'close':
      return (
        <IoClose
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
        <FaSquareFacebook
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
    case 'redo':
      return (
        <LiaRedoAltSolid
          className={className}
          data-icon={name}
          data-icon-source="icons8"
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
      return (
        <LiaSun
          className={className}
          data-icon={name}
          data-icon-source="icons8"
        />
      )
    case 'trail-sign':
      return (
        <IoTrailSignOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'trash':
      return (
        <LiaTrashAlt
          className={className}
          data-icon={name}
          data-icon-source="icons8"
        />
      )
    case 'twitter':
      return (
        <FaTwitter
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'undo':
      return (
        <LiaUndoAltSolid
          className={className}
          data-icon={name}
          data-icon-source="icons8"
        />
      )
  }
}

export default Icon
