import React from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaDiscord,
  FaSquareFacebook,
  FaGithub,
  FaInstagram,
  FaLock,
  FaMastodon,
  FaMinus,
  FaPlus,
  FaTwitter
} from 'react-icons/fa6'
import {
  FiEdit3,
  FiRotateCcw,
  FiRotateCw,
  FiSun,
  FiTrash2
} from 'react-icons/fi'
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

export type IconNames =
  | 'arrow-left'
  | 'arrow-right'
  | 'cart'
  | 'check'
  | 'close'
  | 'copy'
  | 'cube'
  | 'download'
  | 'edit'
  | 'external-link'
  | 'help'
  | 'info'
  | 'keyboard'
  | 'link'
  | 'lock'
  | 'mail'
  | 'minus'
  | 'plus'
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
  | 'google'
  | 'instagram'
  | 'mastodon'
  | 'twitter'

interface IconProps {
  name: IconNames
  className?: string
}

function Icon ({ name, className = '' }: IconProps): React.ReactElement {
  switch (name) {
    case 'arrow-left':
      return (
        <FaArrowLeft
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'arrow-right':
      return (
        <FaArrowRight
          className={className}
          data-icon={name}
          data-icon-source="fa"
        />
      )
    case 'cart':
      return (
        <IoCartOutline
          className={className}
          data-icon={name}
          data-icon-source="io5"
        />
      )
    case 'check':
      return (
        <FaCheck className={className} data-icon={name} data-icon-source="fa" />
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
    case 'edit':
      return (
        <FiEdit3
          className={className}
          data-icon={name}
          data-icon-source="feather"
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
    case 'lock':
      return (
        <FaLock className={className} data-icon={name} data-icon-source="fa" />
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
    case 'minus':
      return (
        <FaMinus className={className} data-icon={name} data-icon-source="fa" />
      )
    case 'plus':
      return (
        <FaPlus className={className} data-icon={name} data-icon-source="fa" />
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
        <FiRotateCw
          className={className}
          data-icon={name}
          data-icon-source="feather"
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
        <FiSun
          className={className}
          data-icon={name}
          data-icon-source="feather"
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
        <FiTrash2
          className={className}
          data-icon={name}
          data-icon-source="feather"
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
        <FiRotateCcw
          className={className}
          data-icon={name}
          data-icon-source="feather"
        />
      )
  }
}

export default Icon
