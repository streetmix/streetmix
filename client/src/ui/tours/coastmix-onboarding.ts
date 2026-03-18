import store from '~/src/store'
import { stopTour } from '~/src/store/slices/app.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import { waitFor, waitForElement } from './waitForElement.js'

import type { StepOptions, Tour } from 'shepherd.js'
import { hideCoastalFloodingPanel } from '~src/store/slices/coastmix.js'

const modalOverlayOptions = {
  modalOverlayOpeningPadding: 5,
  modalOverlayOpeningRadius: 5,
}

const nextButton = {
  classes: 'btn btn-primary',
  text: 'Next',
  action() {
    ;(this as unknown as Tour).next()
  },
}

export const steps: StepOptions[] = [
  {
    id: 'coastmix-onboarding-01',
    text: 'Click on "Coastal flooding" to access and adjust flood features.',
    attachTo: {
      element: '.coastmix-controls-button',
      on: 'right',
    },
    classes: 'tour-medium-width',
    advanceOn: {
      event: 'click',
      selector: '.coastmix-controls-button',
    },
    // Only show this step if the coastal flooding panel isn't already open
    showOn() {
      const coastmix = store.getState().coastmix
      return !coastmix.controlsVisible
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-02',
    text: `Sea level rise is a permanent rise in ocean height relative to land due to
      melting glaciers and thermal expansion. As sea levels rise over time, we
      must design for near- and long-term flood risk. We can block flooding
      by strategically elevating parts of a coastal area to reach a target Design
      Flood Elevation (DFE) based on sea level rise projections. In Coastmix,
      you can design for the current sea level or the future sea level expected in
      2030, 2050, and 2070.`,
    attachTo: {
      element: '[data-tour-id="sea-level-control"]',
      on: 'right',
    },
    beforeShowPromise: async () => {
      await waitForElement('.coastmix-controls')
      await waitFor(500)
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-03',
    text: `When a coastal storm occurs, strong winds push water onto land near
      the coast. This temporarily raises sea levels above normal and can cause
      significant flood damage. It is important to factor in storm surge on top
      of higher average sea levels when we design ways to adapt to coastal
      flooding. In Coastmix, you can toggle on the Storm Surge feature to add
      additional water height on top of the current and future sea level rise
      time horizons.`,
    attachTo: {
      element: '[data-tour-id="storm-surge-control"]',
      on: 'right',
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
    /* Make the position of this a lil prettier, because the control is not
       vertically centered */
    modalOverlayOpeningYOffset: -1,
  },
  {
    id: 'coastmix-onboarding-04',
    text: `In Coastmix, you can choose which direction the flooding comes from
      based on how you design your waterfront and where the coast is located.
      This feature will react when you build something high enough to block
      flood waters.`,
    attachTo: {
      element: '[data-tour-id="flood-direction-control"]',
      on: 'right',
    },
    buttons: [
      {
        ...nextButton,
        action() {
          // Hide this panel when we go to the next step to keep the UI clean
          store.dispatch(hideCoastalFloodingPanel())
          ;(this as unknown as Tour).next()
        },
      },
    ],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-05',
    text: `Click or hover over an element in your waterfront to access and adjust its elevation.`,
    attachTo: {
      element: '[data-testid="segment"]',
      on: 'bottom',
    },
    advanceOn: {
      // TODO: hover is broken; but opening a popup closes the infobubble (tour steals focus?)
      event: 'click',
      selector: '[data-testid="segment"]',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-06',
    text: `Building off of Streetmix, Coastmix introduces a new vertical elevation
      function. Design your waterfront to prevent flooding under different
      sea level rise time horizons, with or without storm surge, by increasing
      the vertical elevation of an element in your waterfront. Use the arrows
      to adjust the elevation or type an amount. If sea level rise is enabled, you
      can address flooding by elevating a feature sufficiently.`,
    attachTo: {
      element: '[data-tour-id="elevation-control"]',
      on: 'right',
    },
    beforeShowPromise: async () => {
      await waitForElement('.popup-container')
      await waitFor(500)
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-07',
    text: `While some coastal resilience strategies may be vertical, such as a
      seawall, others may be sloped to reach a target Design Flood Elevation
      more gradually. After you elevate a feature, you can enable a slope to the
      adjacent feature(s). But watch out for features with very steep slopes: they might not be accessible!`,
    attachTo: {
      element: '[data-tour-id="slope-control"]',
      on: 'right',
    },
    buttons: [
      {
        ...nextButton,
        action() {
          store.dispatch(showDialog('COASTMIX_TUTORIAL_COMPLETE'))
          store.dispatch(stopTour())
          ;(this as unknown as Tour).complete()
        },
      },
    ],
    ...modalOverlayOptions,
  },
]
