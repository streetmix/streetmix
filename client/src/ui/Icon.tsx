import {
  IconArrowAutofitContent,
  IconArrowAutofitHeight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBeach,
  IconBeachOff,
  IconBook2,
  IconCellSignal1,
  IconChartBar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClipboard,
  IconClockHour4,
  IconCopy,
  IconCubeSpark,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFlag,
  IconGift,
  IconHelp,
  IconInfoCircle,
  IconKeyboard,
  IconLanguage,
  IconLayoutGridAdd,
  IconLineHeight,
  IconLink,
  IconLogout,
  IconMail,
  IconMapPin,
  IconPrinter,
  IconRulerMeasure,
  IconSailboat,
  IconSettings,
  IconShoppingCart,
  IconSignRight,
  IconStar,
  IconSunset2,
  IconTrash,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaBluesky,
  FaCheck,
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLock,
  FaMastodon,
  FaMinus,
  FaPlus,
  FaSquareFacebook,
  FaTwitter,
} from 'react-icons/fa6'
import { MdOutlineAddRoad } from 'react-icons/md'

import googleIcon from 'url:./icons/google.svg'

const ICONS = {
  'arrow-left': [FaArrowLeft, 'fa'],
  'arrow-right': [FaArrowRight, 'fa'],
  beach: [IconBeach, 'tabler'],
  'beach-off': [IconBeachOff, 'tabler'],
  boat: [IconSailboat, 'tabler'],
  book: [IconBook2, 'tabler'],
  'building-height': [IconArrowAutofitHeight, 'tabler'],
  cart: [IconShoppingCart, 'tabler'],
  chart: [IconChartBar, 'tabler'],
  check: [FaCheck, 'fa'],
  'chevron-down': [IconChevronDown, 'tabler'],
  'chevron-left': [IconChevronLeft, 'tabler'],
  'chevron-right': [IconChevronRight, 'tabler'],
  clipboard: [IconClipboard, 'tabler'],
  close: [IconX, 'tabler'],
  copy: [IconCopy, 'tabler'],
  cube: [IconCubeSpark, 'tabler'],
  download: [IconDownload, 'tabler'],
  edit: [IconEdit, 'tabler'],
  elevation: [IconLineHeight, 'tabler'],
  'external-link': [IconExternalLink, 'tabler'],
  flag: [IconFlag, 'tabler'],
  help: [IconHelp, 'tabler'],
  info: [IconInfoCircle, 'tabler'],
  keyboard: [IconKeyboard, 'tabler'],
  language: [IconLanguage, 'tabler'],
  link: [IconLink, 'tabler'],
  location: [IconMapPin, 'tabler'],
  lock: [FaLock, 'fa'],
  mail: [IconMail, 'tabler'],
  minus: [FaMinus, 'fa'],
  'new-street': [MdOutlineAddRoad, 'md'],
  plus: [FaPlus, 'fa'],
  print: [IconPrinter, 'tabler'],
  redo: [IconArrowForwardUp, 'tabler'],
  ruler: [IconRulerMeasure, 'tabler'],
  settings: [IconSettings, 'tabler'],
  'sign-out': [IconLogout, 'tabler'],
  'slice-width': [IconArrowAutofitContent, 'tabler'],
  slope: [IconCellSignal1, 'tabler'],
  star: [IconStar, 'tabler'],
  sun: [IconSunset2, 'tabler'],
  template: [IconLayoutGridAdd, 'tabler'],
  time: [IconClockHour4, 'tabler'],
  'trail-sign': [IconSignRight, 'tabler'],
  trash: [IconTrash, 'tabler'],
  undo: [IconArrowBackUp, 'tabler'],
  user: [IconUser, 'tabler'],
  'whats-new': [IconGift, 'tabler'],

  // Social icons
  // Google is not defined here, see special case
  bluesky: [FaBluesky, 'fa'],
  discord: [FaDiscord, 'fa'],
  facebook: [FaSquareFacebook, 'fa'],
  github: [FaGithub, 'fa'],
  instagram: [FaInstagram, 'fa'],
  mastodon: [FaMastodon, 'fa'],
  twitter: [FaTwitter, 'fa'],
}

type BaseIconNames = keyof typeof ICONS
type ExtraIconNames = 'google'
export type IconNames = BaseIconNames | ExtraIconNames

interface IconProps {
  name: IconNames
  size?: string
  stroke?: string

  // All other props
  [attr: string]: string | undefined
}

function makeComponent(
  name: BaseIconNames,
  props?: Record<string, string | undefined>
) {
  const [Component, source] = ICONS[name]

  // Gradually replace react-icons with other sources because it doesn't
  // tree-shake. For 'tabler' icons return components this way
  if (source === 'tabler') {
    const { size = '16', stroke = '1.75', ...restProps } = props ?? {}
    return (
      <Component data-icon={name} size={size} stroke={stroke} {...restProps} />
    )
  }

  // Fall-through for react-icons
  return (
    <Component
      // Usually you want to target an icon by its name in CSS
      data-icon={name}
      // Pass through all other props. e.g. class name is the most obvious
      // use case, but also aria attributes when wrapped with <AccessibleIcon />
      {...props}
    />
  )
}

function Icon({ name, ...restProps }: IconProps) {
  // The Google icon is a special case because it's the only multicolor one.
  // The colors are baked into the source image.
  // TODO: this can return an SVG also, if we want.
  if (name === 'google') {
    return <img src={googleIcon} alt="" {...restProps} />
  }

  return makeComponent(name, restProps)
}

export default Icon
