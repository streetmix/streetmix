import React from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLock,
  FaMastodon,
  FaMinus,
  FaPlus,
  FaSquareFacebook,
  FaTwitter
} from 'react-icons/fa6'
import {
  FiBarChart2,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFlag,
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
  IoLanguage,
  IoMailOutline,
  IoPrintOutline,
  IoRocketOutline,
  IoTrailSignOutline
} from 'react-icons/io5'
import {
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

  // All other props
  [attr: string]: string
}

const ICONS = {
  'arrow-left': [FaArrowLeft, 'fa'],
  'arrow-right': [FaArrowRight, 'fa'],
  cart: [IoCartOutline, 'io5'],
  check: [FaCheck, 'fa'],
  'chevron-down': [FiChevronDown, 'feather'],
  'chevron-left': [FiChevronLeft, 'feather'],
  'chevron-right': [FiChevronRight, 'feather'],
  close: [FiX, 'feather'],
  copy: [FiClipboard, 'feather'],
  cube: [RxCube, 'radix'],
  download: [RxDownload, 'radix'],
  edit: [FiEdit3, 'feather'],
  'external-link': [FiExternalLink, 'feather'],
  flag: [FiFlag, 'feather'],
  graph: [FiBarChart2, 'feather'],
  help: [IoHelpCircleOutline, 'io5'],
  info: [IoInformationCircleOutline, 'io5'],
  keyboard: [RxKeyboard, 'radix'],
  language: [IoLanguage, 'io5'],
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
  attrs?: Record<string, string>
): React.ReactElement {
  const [Component, source] = ICONS[name]

  return (
    <Component
      // Usually you want to target an icon by its name in CSS
      data-icon={name}
      // Sometimes you can target an entire family of icons. For instance
      // Radix UI is optimized at 15×15, most others use 16×16, so we also
      // record the icon source on the element
      data-icon-source={source}
      // Pass through all other props. e.g. class name is the most obvious
      // use case, but also aria attributes when wrapped with <AccessibleIcon />
      {...attrs}
    />
  )
}

function Icon ({ name, ...attrs }: IconProps): React.ReactElement {
  // The Google icon is a special case because it's the only multicolor one.
  // The colors are baked into the source image.
  // TODO: this can return an SVG also, if we want.
  if (name === 'google') {
    return <img src={googleIcon} alt="" {...attrs} />
  }

  return makeComponent(name, attrs)
}

export default Icon
