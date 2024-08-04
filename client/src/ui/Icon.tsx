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
  FiBarChart2,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiMapPin,
  FiRotateCcw,
  FiRotateCw,
  FiSun,
  FiTrash2,
  FiUser,
  FiX
} from 'react-icons/fi'
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
  RxKeyboard,
  RxLink2,
  RxMixerHorizontal,
  RxRulerHorizontal,
  RxStar
} from 'react-icons/rx'

import googleIcon from './icons/google.svg'

export type IconNames = BaseIconNames | ExtraIconNames
type BaseIconNames = keyof typeof ICONS
type ExtraIconNames = 'google'

interface IconProps {
  name: IconNames
  className?: string
}

const ICONS = {
  'arrow-left': [FaArrowLeft, 'fa'],
  'arrow-right': [FaArrowRight, 'fa'],
  cart: [IoCartOutline, 'io5'],
  check: [FaCheck, 'fa'],
  'chevron-down': [FiChevronDown, 'feather'],
  close: [FiX, 'feather'],
  copy: [RxClipboardCopy, 'radix'],
  cube: [RxCube, 'radix'],
  download: [RxDownload, 'radix'],
  edit: [FiEdit3, 'feather'],
  'external-link': [FiExternalLink, 'feather'],
  graph: [FiBarChart2, 'feather'],
  help: [IoHelpCircleOutline, 'io5'],
  info: [IoInformationCircleOutline, 'io5'],
  keyboard: [RxKeyboard, 'radix'],
  link: [RxLink2, 'radix'],
  location: [FiMapPin, 'feather'],
  lock: [FaLock, 'fa'],
  mail: [IoMailOutline, 'io5'],
  minus: [FaMinus, 'fa'],
  plus: [FaPlus, 'fa'],
  print: [IoPrintOutline, 'io5'],
  redo: [FiRotateCw, 'feather'],
  rocket: [IoRocketOutline, 'io5'],
  ruler: [RxRulerHorizontal, 'radix'],
  settings: [RxMixerHorizontal, 'radix'],
  'sign-out': [RxExit, 'radix'],
  star: [RxStar, 'radix'],
  sun: [FiSun, 'feather'],
  time: [FiClock, 'feather'],
  'trail-sign': [IoTrailSignOutline, 'io5'],
  trash: [FiTrash2, 'feather'],
  undo: [FiRotateCcw, 'feather'],
  user: [FiUser, 'feather'],

  // Social icons
  // Google is not defined here, see special case
  discord: [FaDiscord, 'fa'],
  facebook: [FaSquareFacebook, 'fa'],
  github: [FaGithub, 'fa'],
  instagram: [FaInstagram, 'fa'],
  mastodon: [FaMastodon, 'fa'],
  twitter: [FaTwitter, 'fa']
}

function makeComponent (
  name: BaseIconNames,
  className: string,
  attrs?: Record<string, string>
): React.ReactElement {
  const [Component, source] = ICONS[name]

  return (
    <Component
      className={className}
      // Usually you want to target an icon by its name in CSS
      data-icon={name}
      // Sometimes you can target an entire family of icons. For instance
      // Radix UI is optimized at 15×15, most others use 16×16, so we also
      // record the icon source on the element
      data-icon-source={source}
      // Pass through all other props. e.g. when an icon is wrapped with
      // <AccessibleIcon />
      {...attrs}
    />
  )
}

function Icon ({
  name,
  className = '',
  ...attrs
}: IconProps): React.ReactElement {
  // The Google icon is a special case because it's the only multicolor one.
  // The colors are baked into the source image.
  // TODO: this can return an SVG also, if we want.
  if (name === 'google') {
    return <img className={className} src={googleIcon} alt="" {...attrs} />
  }

  return makeComponent(name, className, attrs)
}

export default Icon
