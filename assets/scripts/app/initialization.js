import { hideLoadingScreen, loadImages } from './load_resources'
import { initLocale } from './locale'
import { scheduleNextLiveUpdateCheck } from './live_update'
import { showGallery } from '../gallery/view'
import { debug } from '../preinit/debug_settings'
import { system } from '../preinit/system_capabilities'
import { initializeFlagSubscribers } from '../app/flag_utils'
import { segmentsChanged, localizeStreetSegments } from '../segments/view'
import { onNewStreetLastClick } from '../streets/creation'
import {
  createDomFromData,
  setLastStreet,
  trimStreetData,
  setIgnoreStreetChanges
} from '../streets/data_model'
import { updateStreetName } from '../streets/name'
import { initStreetReduxTransitionSubscriber } from '../streets/street'
import { getPromoteStreet, remixStreet } from '../streets/remix'
import { resizeStreetWidth } from '../streets/width'
import { loadSignIn } from '../users/authentication'
import { updateSettingsFromCountryCode } from '../users/localization'
import { detectGeolocation } from '../users/geolocation'
import { initPersistedSettingsStoreObserver } from '../users/settings'
import { addEventListeners } from './event_listeners'
import { trackEvent } from './event_tracking'
import { getMode, setMode, MODES, processMode } from './mode'
import { processUrl, updatePageUrl } from './page_url'
import { onResize } from './window_resize'
import { startListening } from './keypress'
import { registerKeypresses } from './keyboard_commands'
import { attachFetchNonBlockingEventListeners } from '../util/fetch_nonblocking'
import store, { observeStore } from '../store'
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

  registerKeypresses()

  // Start listening for keypresses
  startListening()

  attachFetchNonBlockingEventListeners()
  observeStoreToUpdateBodyClasses()
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
  updateStreetName(store.getState().street)
  createDomFromData()
  segmentsChanged(false)

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(store.getState().street))
  initStreetReduxTransitionSubscriber()
  localizeStreetSegments()
  initializeFlagSubscribers()
  initPersistedSettingsStoreObserver()

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

/**
 * Toggle features based on system state. (This allows toggling to debug things,
 * which will allow us to remove the debug URL parameters as a future TODO)
 */
function observeStoreToUpdateBodyClasses () {
  const select = (state) => ({ system: state.system, app: state.app })
  const onChange = (state) => {
    document.body.classList.toggle('windows', state.system.windows)
    document.body.classList.toggle('safari', state.system.safari)
    document.body.classList.toggle('touch-support', state.system.touch)
    document.body.classList.toggle('phone', state.system.phone)
    document.body.classList.toggle('no-internet', state.system.noInternet)
    document.body.classList.toggle('read-only', state.app.readOnly)

    // Disable links in no-internet mode
    if (state.system.noInternet === true) {
      document.body.addEventListener('click', blockLinksOnClick)
    } else {
      document.body.removeEventListener('click', blockLinksOnClick)
    }
  }

  return observeStore(select, onChange)
}

/**
 * Disable all external links
 * CSS takes care of altering their appearance to resemble normal text
 */
function blockLinksOnClick (event) {
  if (event.target.nodeName === 'A' && event.target.getAttribute('href').indexOf('http') === 0) {
    event.preventDefault()
  }
}
