import store from '~/src/store'
import { stopTour } from '~/src/store/slices/app.js'
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

let cleanup: (() => void) | null = null

export const steps: StepOptions[] = [
  {
    id: 'coastmix-practice-01',
    text: `In this practice scenario, you will address 2030 sea level rise
      with an optional storm surge.`,
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-02',
    text: `To start, click “New waterfront” and select the “Harborwalk” template.`,
    attachTo: {
      element: '#menubar-new',
      on: 'bottom',
    },
    advanceOn: {
      event: 'click',
      selector: '#menubar-new',
    },
    ...modalOverlayOptions,
  },
  // TODO: broken step
  // Also -- how to recover to this state when we open in a new window?
  // Current thought -- it's a new tour actually -- activated via the URL
  // {
  //   id: 'coastmix-practice-02b',
  //   extraHighlights: ['[data-tour-id="new-street-harborwalk"]'],
  //   advanceOn: {
  //     event: 'click',
  //     selector: '[data-tour-id="new-street-harborwalk"]',
  //   },
  //   ...modalOverlayOptions,
  // },
  {
    id: 'coastmix-practice-03',
    text: `Click “Coastal Flooding” to access and adjust flood features.`,
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
    // assuming not already selected
    id: 'coastmix-practice-04',
    text: `Next, select 2030 sea level rise.`,
    attachTo: {
      element: '[data-tour-id="2030-sea-level-rise"]',
      on: 'bottom',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="2030-sea-level-rise"]',
    },
    beforeShowPromise: async () => {
      await waitForElement('.coastmix-controls')
      await waitFor(500)
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-05',
    text: `For an extra challenge, you can turn on storm surge.`,
    attachTo: {
      element: '[data-tour-id="storm-surge-control"] button',
      on: 'bottom',
    },
    extraHighlights: [
      '[data-tour-id="storm-surge-control"]',
      '[data-tour-id="storm-surge-control"] button',
    ],
    buttons: [nextButton],
    ...modalOverlayOptions,
    // Make the position of this a lil prettier, because the control is not
    // vertically centered
    modalOverlayOpeningYOffset: -1,
  },
  {
    id: 'coastmix-practice-06',
    text: `Set the flood direction to “Right,” which is the location of the waterfront
      in this environment.`,
    attachTo: {
      element: '[data-tour-id="flood-direction-control"]',
      on: 'right',
    },
    when: {
      show() {
        const el = document.querySelector<HTMLSelectElement>(
          '[data-tour-id="flood-direction-control"] select'
        )
        if (!el) return

        const tour = this as unknown as Tour

        function handler() {
          if (!el) return
          if (el.value === 'right') {
            // why parent object with tour inside of it?
            tour.tour.next()
          }
        }

        el.addEventListener('change', handler)
        cleanup = () => el.removeEventListener('change', handler)

        // If it’s already correct (e.g., persisted setting), advance immediately
        // hmmmm
        if (el.value === 'right') tour.tour.next()
      },
      hide() {
        cleanup?.()
        cleanup = null
      },
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-06b',
    text: `Oh no! You can see that our harborwalk environment is flooded.
      There are many ways to protect against future sea level rise, but for
      this scenario, we’ll be building an elevated harborwalk with a sloped
      berm.`,
    attachTo: {
      element: '[data-tour-id="flooding-message"]',
      on: 'bottom',
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-07',
    text: `First, click or hover on the “Harborwalk” feature next to the
      water.`,
    attachTo: {
      element: '[data-slice-label="Harborwalk"]',
      on: 'bottom',
    },
    advanceOn: {
      // TODO: hover is broken; but opening a popup closes the infobubble (tour steals focus?)
      event: 'click',
      selector: '[data-slice-label="Harborwalk"]',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-08a',
    text: `Elevate the Harborwalk feature to 2 feet. If you turned on storm surge,
      you may need to elevate it a little more.`,
    attachTo: {
      element: '[data-tour-id="elevation-control"]',
      on: 'right',
    },
    beforeShowPromise: async () => {
      await waitForElement('.popup-container')
      await waitFor(500)
    },
    ...modalOverlayOptions,
  },
  {
    // TODO: actiate on successful scenario addrressing.
    id: 'coastmix-practice-08b',
    text: `Sea level rise and storm surge
      are now addressed by elevating the Harborwalk, but the public realm
      behind it needs to be integrated into this new condition.`,
    when: {
      show() {
        const el = document.querySelector<HTMLSelectElement>(
          '[data-tour-id="flood-direction-control"] select'
        )
        if (!el) return

        const tour = this as unknown as Tour

        function handler() {
          if (!el) return
          if (el.value === 'right') {
            // why parent object with tour inside of it?
            tour.tour.next()
          }
        }

        el.addEventListener('change', handler)
        cleanup = () => el.removeEventListener('change', handler)

        // If it’s already correct (e.g., persisted setting), advance immediately
        // hmmmm
        if (el.value === 'right') tour.tour.next()
      },
      hide() {
        cleanup?.()
        cleanup = null
      },
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-9',
    text: `Click on the feature called “Future berm.”`,
    attachTo: {
      element: '[data-slice-label="Future berm"]',
      on: 'bottom',
    },
    advanceOn: {
      // TODO: hover is broken; but opening a popup closes the infobubble (tour steals focus?)
      event: 'click',
      selector: '[data-slice-label="Future berm"]',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-10',
    text: `Toggle the slope function “On.”`,
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-11',
    text: `Rename “Future berm” to “Berm” by typing into the feature box’s title.`,
    buttons: [
      {
        ...nextButton,
        action() {
          store.dispatch(showDialog('COASTMIX_PRACTICE_COMPLETE'))
          store.dispatch(stopTour())
          ;(this as unknown as Tour).complete()
        },
      },
    ],
    ...modalOverlayOptions,
  },
]
