import { waitFor, waitForElement } from './waitForElement.js'

import type { Tour } from 'shepherd.js'

const nextButton = {
  classes: 'btn btn-primary',
  text: 'Next',
  action() {
    ;(this as unknown as Tour).next()
  },
}

export const steps = [
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
    buttons: [nextButton],
  },
]
