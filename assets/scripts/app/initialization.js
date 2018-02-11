import { hideLoadingScreen, loadImages } from './load_resources'
import { initLocale } from './locale'
import { scheduleNextLiveUpdateCheck } from './live_update'
import { showGallery } from '../gallery/view'
import { app } from '../preinit/app_settings'
import { debug } from '../preinit/debug_settings'
import { system } from '../preinit/system_capabilities'
import { initializeFlagSubscribers } from '../app/flag_utils'
import { fillEmptySegments, segmentsChanged } from '../segments/view'
import { initStreetReduxTransitionSubscriber } from '../streets/street'
import { onNewStreetLastClick } from '../streets/creation'
import {
  createDomFromData,
  setLastStreet,
  trimStreetData,
  getStreet,
  setStreetDataInRedux,
  setIgnoreStreetChanges
} from '../streets/data_model'
import { updateStreetName } from '../streets/name'
import { getPromoteStreet, remixStreet } from '../streets/remix'
import { resizeStreetWidth } from '../streets/width'
import { loadSignIn } from '../users/authentication'
import { updateSettingsFromCountryCode } from '../users/localization'
import { detectGeolocation } from '../users/geolocation'
import { addEventListeners } from './event_listeners'
import { trackEvent } from './event_tracking'
import { getMode, setMode, MODES, processMode } from './mode'
import { processUrl, updatePageUrl } from './page_url'
import { onResize } from './window_resize'
import { attachBlockingShieldEventListeners } from './blocking_shield'
import { registerKeypresses } from './keyboard_commands'
import { infoBubble } from '../info_bubble/info_bubble'
import { attachFetchNonBlockingEventListeners } from '../util/fetch_nonblocking'
import store from '../store'
import { showDialog } from '../store/actions/dialogs'
import { everythingLoaded } from '../store/actions/app'

let serverContacted

export function setServerContacted (value) {
  serverContacted = value
}

function preInit () {
  setIgnoreStreetChanges(true)

  var language = window.navigator.userLanguage || window.navigator.language
  if (language) {
    language = language.substr(0, 2).toUpperCase()
    updateSettingsFromCountryCode(language)
  }

  attachBlockingShieldEventListeners()
  registerKeypresses()
  infoBubble.registerKeypresses()
  attachFetchNonBlockingEventListeners()
}

export async function initialize () {
  preInit()
  if (!debug.forceUnsupportedBrowser) {
    // TODO temporary ban
    if ((navigator.userAgent.indexOf('Opera') !== -1) ||
      (navigator.userAgent.indexOf('Internet Explorer') !== -1) ||
      (navigator.userAgent.indexOf('MSIE') !== -1)) {
      setMode(MODES.UNSUPPORTED_BROWSER)
      processMode()
      return
    }
  }

  window.dispatchEvent(new window.CustomEvent('stmx:init'))

  fillEmptySegments()

  processUrl()
  processMode()
  if (store.getState().errors.abortEverything) {
    return
  }

  // Asynchronously loading…

  // Geolocation
  // …detect country from IP for units, left/right-hand driving, and
  // adding location to streets
  const geo = await detectGeolocation()

  // Parallel tasks
  await Promise.all([ loadImages(), geo ])

  if (geo && geo.country_code) {
    updateSettingsFromCountryCode(geo.country_code)
  }

  document.querySelector('#loading-progress').value++

  // Sign in
  // …sign in info from our API (if not previously cached) – and subsequent
  // street data if necessary (depending on the mode)
  await loadSignIn()

  // Note that we are waiting for sign in and image info to show the page,
  // but we give up on country info if it’s more than 1000ms.

  checkIfEverythingIsLoaded()
}

export function checkIfEverythingIsLoaded () {
  if (store.getState().errors.abortEverything) {
    return
  }

  if (serverContacted) {
    onEverythingLoaded()
  }
}

function onEverythingLoaded () {
  switch (getMode()) {
    case MODES.NEW_STREET_COPY_LAST:
      onNewStreetLastClick()
      break
  }

  onResize()
  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged(false)

  setIgnoreStreetChanges(false)
  setStreetDataInRedux()
  setLastStreet(trimStreetData(getStreet()))
  initStreetReduxTransitionSubscriber()
  initializeFlagSubscribers()

  updatePageUrl()
  addEventListeners()

  store.dispatch(everythingLoaded())
  var event = new window.CustomEvent('stmx:everything_loaded')
  window.dispatchEvent(event)

  if (debug.forceLiveUpdate) {
    scheduleNextLiveUpdateCheck()
  }

  window.setTimeout(hideLoadingScreen, 0)

  var mode = getMode()
  if (mode === MODES.USER_GALLERY) {
    showGallery(store.getState().gallery.userId, true)
  } else if (mode === MODES.GLOBAL_GALLERY) {
    showGallery(null, true)
  }

  if (getPromoteStreet()) {
    remixStreet()
  }

  // Track touch capability in Google Analytics
  if (system.touch === true) {
    trackEvent('SYSTEM', 'TOUCH_CAPABLE', null, null, true)
  }

  // Display "support Streetmix" dialog for returning users
  if (mode === MODES.EXISTING_STREET || mode === MODES.CONTINUE) {
    let welcomeDismissed
    let donateDismissed
    const twoWeeksAgo = Date.now() - 12096e5
    const flag = store.getState().flags.DONATE_NAG_SCREEN.value
    if (window.localStorage['settings-welcome-dismissed']) {
      welcomeDismissed = JSON.parse(window.localStorage['settings-welcome-dismissed'])
    }
    if (window.localStorage['settings-donate-dismissed']) {
      donateDismissed = JSON.parse(window.localStorage['settings-donate-dismissed'])
    }

    // if there's no delayed timestamp, immediately set one
    // This means the user should not see the donate nag until
    // they have returned after 2 weeks.
    if (!window.localStorage['settings-donate-delayed-timestamp']) {
      window.localStorage['settings-donate-delayed-timestamp'] = Date.now().toString()
    }

    const delayedTimestamp = JSON.parse(window.localStorage['settings-donate-delayed-timestamp'])

    if (welcomeDismissed && !donateDismissed && flag &&
       (!delayedTimestamp || delayedTimestamp < twoWeeksAgo)) {
      store.dispatch(showDialog('DONATE'))
    }
  }
}

// Initalize i18n / localization
// Currently experimental-only for all languages except English
const flags = store.getState().flags
const enableLocales = flags.LOCALES_LEVEL_1.value || flags.LOCALES_LEVEL_2.value || flags.LOCALES_LEVEL_3.value
initLocale(enableLocales)

// Other
addBodyClasses()

// Check if no internet mode
if (system.noInternet === true) {
  setupNoInternetMode()
}

function addBodyClasses () {
  if (system.windows) {
    document.body.classList.add('windows')
  }

  if (system.safari) {
    document.body.classList.add('safari')
  }

  if (system.touch) {
    document.body.classList.add('touch-support')
  }

  if (app.readOnly) {
    document.body.classList.add('read-only')
  }

  if (system.phone) {
    document.body.classList.add('phone')
  }

  if (system.noInternet) {
    document.body.classList.add('no-internet')
  }
}

function setupNoInternetMode () {
  // Disable all external links
  // CSS takes care of altering their appearance to resemble normal text
  document.body.addEventListener('click', function (e) {
    if (e.target.nodeName === 'A' && e.target.getAttribute('href').indexOf('http') === 0) {
      e.preventDefault()
    }
  })
}
