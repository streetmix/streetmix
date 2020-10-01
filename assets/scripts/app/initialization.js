import { debug } from '../preinit/debug_settings'
import { initSystemCapabilities } from '../preinit/system_capabilities'
import { hideLoadingScreen, loadImages } from './load_resources'
import { scheduleNextLiveUpdateCheck } from './live_update'
import { initializeFlagSubscribers } from '../app/flag_utils'
import { segmentsChanged } from '../segments/view'
import { initLocale } from '../locales/locale'
import { setLastStreet, setIgnoreStreetChanges } from '../streets/data_model'
import { initStreetNameChangeListener } from '../streets/name'
import { initStreetThumbnailSubscriber } from '../streets/image'
import { initStreetDataChangedListener } from '../streets/street'
import { initEnvironsChangedListener } from '../streets/environs'
import { initDragTypeSubscriber } from '../segments/drag_and_drop'
import { getPromoteStreet, remixStreet } from '../streets/remix'
import { fetchLastStreet } from '../streets/xhr'
import { loadSignIn } from '../users/authentication'
import { updateSettingsFromCountryCode } from '../users/localization'
import { detectGeolocation } from '../users/geolocation'
import { initSettingsStoreObserver } from '../users/settings'
import { addEventListeners } from './event_listeners'
import { getMode, setMode, MODES, processMode } from './mode'
import { processUrl } from './page_url'
import { startListening } from './keypress'
import { registerKeypresses } from './keyboard_commands'
import store, { observeStore } from '../store'
import { openGallery } from '../store/actions/gallery'
import { showDialog } from '../store/slices/dialogs'
import { everythingLoaded } from '../store/slices/app'

let serverContacted

export function setServerContacted (value) {
  serverContacted = value
}

function preInit () {
  initSystemCapabilities()
  setIgnoreStreetChanges(true)

  var language = window.navigator.userLanguage || window.navigator.language
  if (language) {
    language = language.substr(0, 2).toUpperCase()
    updateSettingsFromCountryCode(language)
  }

  registerKeypresses()

  // Start listening for keypresses
  startListening()

  observeStoreToUpdateBodyClasses()
}

export async function initialize () {
  preInit()
  if (!debug.forceUnsupportedBrowser) {
    // TODO temporary ban
    if (
      navigator.userAgent.indexOf('Opera') !== -1 ||
      navigator.userAgent.indexOf('Internet Explorer') !== -1 ||
      navigator.userAgent.indexOf('MSIE') !== -1
    ) {
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
  await Promise.all([loadImages(), geo, initLocale()])

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
  if (getMode() === MODES.NEW_STREET_COPY_LAST) {
    fetchLastStreet()
  }

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()
  initStreetDataChangedListener()
  initializeFlagSubscribers()
  initSettingsStoreObserver()
  initStreetThumbnailSubscriber()

  initStreetNameChangeListener()
  initEnvironsChangedListener()
  initDragTypeSubscriber()

  addEventListeners()
  showConsoleMessage()

  store.dispatch(everythingLoaded())

  if (debug.forceLiveUpdate) {
    scheduleNextLiveUpdateCheck()
  }

  window.setTimeout(hideLoadingScreen, 0)

  var mode = getMode()
  if (mode === MODES.USER_GALLERY) {
    store.dispatch(
      openGallery({
        userId: store.getState().gallery.userId,
        instant: true
      })
    )
  } else if (mode === MODES.GLOBAL_GALLERY) {
    store.dispatch(
      openGallery({
        instant: true
      })
    )
  }

  if (getPromoteStreet()) {
    remixStreet()
  }

  // Display "support Streetmix" dialog for returning users
  if (mode === MODES.EXISTING_STREET || mode === MODES.CONTINUE) {
    let welcomeDismissed
    let canDisplayWhatsNew = false

    const LSKEY_WELCOME_DISMISSED = 'settings-welcome-dismissed'
    const LSKEY_WHATSNEW_LAST_TIMESTAMP = 'whatsnew-last-timestamp'

    const whatsNewTimestamp = 1537222458620 // Hard-coded value

    const state = store.getState()
    const whatsNewFlag = state.flags.ALWAYS_DISPLAY_WHATS_NEW.value
    const locale = state.locale.locale

    if (window.localStorage[LSKEY_WELCOME_DISMISSED]) {
      welcomeDismissed = JSON.parse(
        window.localStorage[LSKEY_WELCOME_DISMISSED]
      )
    }

    if (window.localStorage[LSKEY_WHATSNEW_LAST_TIMESTAMP]) {
      if (
        whatsNewTimestamp > window.localStorage[LSKEY_WHATSNEW_LAST_TIMESTAMP]
      ) {
        canDisplayWhatsNew = true
      }
    } else {
      canDisplayWhatsNew = true
    }

    // When to display the What's new dialog?
    // - Store a hardcoded timestamp value here for the what's new dialog.
    // - When we display the what's new dialog, store that timestamp on user's localstorage.
    // On each load, check to see if that timestamp is there, and if so, compare
    // with the hardcoded value.
    // - If we are showing the welcome message, do not show What's New.
    // - If locale is not English, do not show What's New. (We haven't localized it.)
    // - If LocalStorage has no What's New timestamp, display What's New.
    // - If LocalStorage has a timestamp value older than current, display What's New.
    if (
      (welcomeDismissed && canDisplayWhatsNew && locale === 'en') ||
      whatsNewFlag
    ) {
      store.dispatch(showDialog('WHATS_NEW'))
      window.localStorage[LSKEY_WHATSNEW_LAST_TIMESTAMP] = whatsNewTimestamp
    }
  }
}

function showConsoleMessage () {
  console.log(
    `%c
          ____  _    %cWelcome to%c   _             _      _
         / ___|| |_ _ __ ___  ___| |_ _ __ ___ (_)_  _| |
         \\___ \\| __| '__/ _ \\/ _ \\ __| '_ \` _ \\| \\ \\/ / |
          ___) | |_| | |  __/  __/ |_| | | | | | |>  <|_|
         |____/ \\__|_|  \\___|\\___|\\__|_| |_| |_|_/_/\\_(_)
%c..:  We’re looking for contributors!  https://github.com/streetmix/streetmix  :..
%c..:  Support us financially at        https://opencollective.com/streetmix    :..`,
    'color: green',
    'color:gray',
    'color: green',
    'color: blue',
    'color: red'
  )
}

/**
 * Toggle features based on system state. (This allows toggling to debug things,
 * which will allow us to remove the debug URL parameters as a future TODO)
 */
function observeStoreToUpdateBodyClasses () {
  const select = (state) => ({ system: state.system, app: state.app })
  const onChange = (state) => {
    document.body.classList.toggle('windows', state.system.windows)
    document.body.classList.toggle('safari', state.system.safari)
    document.body.classList.toggle('phone', state.system.phone)
    document.body.classList.toggle('read-only', state.app.readOnly)
  }

  return observeStore(select, onChange)
}
