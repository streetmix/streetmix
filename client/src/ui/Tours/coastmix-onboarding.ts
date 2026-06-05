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

const backButton = {
  classes: 'btn btn-tertiary',
  text: 'Back',
  action() {
    ;(this as unknown as Tour).back()
  },
}

const steps: StepOptions[] = [
  {
    id: 'coastmix-onboarding-01',
    title: 'Flooding controls',
    text: `Coastmix provides a new feature, located here, to visualize the
       effect sea level rise in the future. Click this button to continue!`,
    attachTo: {
      element: '[data-tour-id="flooding-controls-button"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    classes: 'tour-medium-width',
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="flooding-controls-button"]',
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
    title: 'Sea level rise',
    text: `<p><strong>Sea level rise</strong> is the gradual increase in the
      height of the world's oceans relative to land, due to melting glaciers
      and thermal expansion from global warming.</p>
      <p>As this happens, we must design for both near- and long-term flood
      risk by strategically raising parts of a coastal area above sea level rise
      projections. This target height is called the <strong>Design Flood
      Elevation (DFE)</strong>.</p>
      <p>In Coastmix, you can design for the current sea level or a future sea
      level rise expected in 2030, 2050, and 2070.</p>`,
    attachTo: {
      element: '[data-tour-id="sea-level-control"]',
      on: 'right',
    },
    highlightClass: 'tour-highlight',
    floatingUIOptions: {
      middleware: [offset({ mainAxis: 0, crossAxis: 10 })],
    },
    beforeShowPromise: async () => {
      await waitForElement('.coastmix-controls')
      await waitFor(300)
    },
    buttons: [backButton, nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-03',
    title: 'Storm surge',
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
    highlightClass: 'tour-highlight',
    buttons: [
      backButton,
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
    // Make the position of this a lil prettier, because the control is not
    // vertically centered
    modalOverlayOpeningYOffset: -1,
  },
  {
    id: 'coastmix-onboarding-05',
    title: 'Select an element',
    text: `Select an element to access and change its properties. Click on this
      one to continue.`,
    attachTo: {
      // Assuming we are on the coastal road element
      element: '[data-slice-index="5"]',
      on: 'bottom',
    },
    highlightClass: 'tour-highlight',
    scrollTo: {
      behavior: 'smooth',
      inline: 'center',
      block: 'end',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-slice-index="5"]',
    },
    buttons: [backButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-06',
    title: 'Raise ground height',
    text: `<p>Coastmix introduces new vertical elevation functionality where you
      can raise or lower the ground height of an element.</p>
      <p>When designing your waterfront, you can raise the ground height of
      individual elements to reach the Design Flood Elevation. Use the plus and
      minus buttons to adjust the height, or type in an amount. If sea level
      rise is enabled, you can visualize the extent of flooding.</p>`,
    attachTo: {
      element: '[data-tour-id="elevation-control"]',
      on: 'right',
    },
    highlightClass: 'tour-highlight',
    beforeShowPromise: async () => {
      await waitForElement('.popup-container')
      await waitFor(300)
    },
    buttons: [backButton, nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-onboarding-07',
    title: 'Creating a slope',
    text: `<p>While some coastal resilience strategies use vertical barriers,
      like a seawall, you can also use a slope to reach the Design Flood
      Elevation more gradually.</p>
      <p>Some elements (but not all) can be sloped. And watch out for features
      with very steep slopes: they might not be accessible!</p>`,
    attachTo: {
      element: '[data-tour-id="slope-control"]',
      on: 'right',
    },
    highlightClass: 'tour-highlight',
    buttons: [
      backButton,
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
