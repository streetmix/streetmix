import { offset } from '@floating-ui/react'

import store from '~/src/store'
import {
  hideCoastalFloodingPanel,
  resetCoastmixState,
} from '~/src/store/slices/coastmix.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import { waitFor, waitForElement } from './waitForElement.js'

import type { StepOptions, Tour } from 'shepherd.js'

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

const steps: StepOptions[] = [
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
    when: {
      show() {
        // Reset Coastmix state for the tutorial.
        store.dispatch(resetCoastmixState())
      },
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-02',
    text: `<p><strong>Sea level rise</strong> is a permanent raising of the
      ocean over time, due to melting glaciers and thermal expansion. As this
      happens, we must design for both near- and long-term flood risk by
      strategically elevating parts of a coastal area above sea level rise
      projections. This target elevation is called the <strong>Design Flood
      Elevation (DFE)</strong>.</p>
      <p>In Coastmix, you can design for the current sea level or a future sea
      level rise expected in 2030, 2050, and 2070.</p>`,
    attachTo: {
      element: '[data-tour-id="sea-level-control"]',
      on: 'right',
    },
    floatingUIOptions: {
      middleware: [offset({ mainAxis: 0, crossAxis: 10 })],
    },
    beforeShowPromise: async () => {
      await waitForElement('.coastmix-controls')
      await waitFor(300)
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-03',
    text: `<p>A <strong>storm surge</strong> occurs during storms when strong
      winds push water onto land along the coast, temporarily raising sea
      levels above normal. This can cause significant flood damage, so it’s
      important to consider storm surges when we design ways to adapt to coastal
      flooding.</p>
      <p>In Coastmix, you can turn on storm surges to add more water height
      on top of sea level rise projections.</p>`,
    attachTo: {
      element: '[data-tour-id="storm-surge-control"]',
      on: 'right',
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
    // Make the position of this a lil prettier, because the control is not
    // vertically centered
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
    text: `Click on an element, like this one, to access and adjust its elevation.`,
    attachTo: {
      // Assuming we are on the coastal road element
      element: '[data-slice-index="5"]',
      on: 'bottom',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-slice-index="5"]',
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
      await waitFor(300)
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
          ;(this as unknown as Tour).complete()
        },
      },
    ],
    ...modalOverlayOptions,
  },
]

export function getSteps() {
  return steps
}
