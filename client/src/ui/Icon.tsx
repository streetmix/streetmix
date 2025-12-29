import {
  IconChartBar,
  IconClipboard,
  IconClockHour4,
  IconCopy,
  IconCubeSpark,
  IconDownload,
  IconKeyboard,
  IconLayoutGridAdd,
  IconLink,
  IconLogout,
  IconMapPin,
  IconPrinter,
  IconRulerMeasure,
  IconSettings,
  IconStar,
  IconUser,
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
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiExternalLink,
  FiFlag,
  FiRotateCcw,
  FiRotateCw,
  FiSun,
  FiTrash2,
} from 'react-icons/fi'
import {
  IoBoatOutline,
  IoBookOutline,
  IoCartOutline,
  IoClose,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoLanguage,
  IoMailOutline,
  IoRocketOutline,
  IoTrailSignOutline,
} from 'react-icons/io5'
import { MdOutlineAddRoad } from 'react-icons/md'

import googleIcon from 'url:./icons/google.svg'

const ICONS = {
  'arrow-left': [FaArrowLeft, 'fa'],
  'arrow-right': [FaArrowRight, 'fa'],
  boat: [IoBoatOutline, 'io5'],
  book: [IoBookOutline, 'io5'],
  cart: [IoCartOutline, 'io5'],
  chart: [IconChartBar, 'tabler'],
  check: [FaCheck, 'fa'],
  'chevron-down': [FiChevronDown, 'feather'],
  'chevron-left': [FiChevronLeft, 'feather'],
  'chevron-right': [FiChevronRight, 'feather'],
  clipboard: [IconClipboard, 'tabler'],
  close: [IoClose, 'io5'],
  copy: [IconCopy, 'tabler'],
  cube: [IconCubeSpark, 'tabler'],
  download: [IconDownload, 'tabler'],
  edit: [FiEdit3, 'feather'],
  'external-link': [FiExternalLink, 'feather'],
  flag: [FiFlag, 'feather'],
  help: [IoHelpCircleOutline, 'io5'],
  info: [IoInformationCircleOutline, 'io5'],
  keyboard: [IconKeyboard, 'tabler'],
  language: [IoLanguage, 'io5'],
  link: [IconLink, 'tabler'],
  location: [IconMapPin, 'tabler'],
  lock: [FaLock, 'fa'],
  mail: [IoMailOutline, 'io5'],
  minus: [FaMinus, 'fa'],
  'new-street': [MdOutlineAddRoad, 'md'],
  plus: [FaPlus, 'fa'],
  print: [IconPrinter, 'tabler'],
  redo: [FiRotateCw, 'feather'],
  rocket: [IoRocketOutline, 'io5'],
  ruler: [IconRulerMeasure, 'tabler'],
  settings: [IconSettings, 'tabler'],
  'sign-out': [IconLogout, 'tabler'],
  star: [IconStar, 'tabler'],
  sun: [FiSun, 'feather'],
  template: [IconLayoutGridAdd, 'tabler'],
  time: [IconClockHour4, 'tabler'],
  'trail-sign': [IoTrailSignOutline, 'io5'],
  trash: [FiTrash2, 'feather'],
  undo: [FiRotateCcw, 'feather'],
  user: [IconUser, 'tabler'],

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
      <Component
        data-icon={name}
        data-icon-source={source}
        size={size}
        stroke={stroke}
        {...restProps}
      />
    )
  }

  // Fall-through for react-icons
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
