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
    title: 'Coastmix practice scenario',
    text: `In this practice scenario, you will address 2030 sea level rise
      with an optional storm surge.`,
    classes: 'tour-dialog',
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-02',
    text: `To start, click “New waterfront” menu.`,
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
  {
    id: 'coastmix-practice-02b',
    text: `Select the “Harborwalk” template.`,
    attachTo: {
      element: '[data-tour-id="new-street-harborwalk"]',
      on: 'left',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="new-street-harborwalk"]',
    },
    beforeShowPromise: async () => {
      await waitFor(300)
    },
  },
  {
    id: 'coastmix-practice-03',
    text: `Your new “Harborwalk” template has opened in another browser tab. Switch to that tab to continue with the practice scenerio.`,
    buttons: [
      {
        classes: 'btn',
        text: 'Dismiss',
        action() {
          ;(this as unknown as Tour).complete()
        },
      },
    ],
  },
]

// Triggered by the "new street" welcome panel, kind of a hack though.
export const steps2: StepOptions[] = [
  {
    id: 'coastmix-practice-04a',
    title: 'Coastmix practice scenario',
    text: `<p>This is a typical cross-section of a harborwalk at sea level.</p>
      <p>
        Next, we'll use Coastmix to raise the sea level to 2030 projected
        height, and see how that affects our waterfront.
      </p>`,
    classes: 'tour-dialog',
    buttons: [nextButton],
  },
  {
    id: 'coastmix-practice-04',
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
    id: 'coastmix-practice-05',
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
      await waitFor(300)
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-06',
    text: `For an extra challenge, you can turn on storm surge. This is totally optional, though!`,
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
    id: 'coastmix-practice-07',
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
    id: 'coastmix-practice-08',
    text: `Oh no! You can see that our harborwalk environment is flooded.
      There are many ways to protect against future sea level rise, but for
      this scenario, we’ll be building an elevated harborwalk with a sloped
      berm.`,
    attachTo: {
      element: '[data-tour-id="flooding-message"]',
      on: 'bottom',
    },
    buttons: [nextButton],
  },
  {
    id: 'coastmix-practice-09',
    text: `First, click on the “Harborwalk” feature next to the
      water.`,
    attachTo: {
      element: '[data-slice-label="Harborwalk"]',
      on: 'bottom',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-slice-label="Harborwalk"]',
    },
    ...modalOverlayOptions,
  },
  {
    // NOTE -- this step is manually controlled through the CoastalFloodingPanel
    // component instead of detecting changes here (and we probably don't want to
    // do this, long term. But it works for now)
    id: 'coastmix-practice-10',
    text: `Elevate the Harborwalk feature until it blocks the flood waters.`,
    attachTo: {
      element: '[data-tour-id="elevation-control"]',
      on: 'right',
    },
    beforeShowPromise: async () => {
      await waitForElement('.popup-container')
      await waitFor(300)
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-11',
    text: `Sea level rise and storm surge
      are now addressed by elevating the Harborwalk, but the public realm
      behind it needs to be integrated into this new condition.`,
    buttons: [nextButton],
    attachTo: {
      element: '[data-tour-id="flooding-message"]',
      on: 'bottom',
    },
  },
  {
    id: 'coastmix-practice-12',
    text: `Click on the feature called “Future berm.”`,
    attachTo: {
      element: '[data-slice-label="Future berm"]',
      on: 'bottom',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-slice-label="Future berm"]',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-13',
    text: `Toggle the slope function “On.”`,
    attachTo: {
      element: '[data-tour-id="slope-control"]',
      on: 'right',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="slope-control"]',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-14',
    text: `Now our “Future berm” is a current berm! You can rename
      an element by clicking on the name here, and then type “Berm”
      in the subsequent popup window.`,
    attachTo: {
      element: '[data-tour-id="editable-label"]',
      on: 'top',
    },
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="editable-label"]',
    },
    ...modalOverlayOptions,
  },
  // Conclusion dialog is integrated into tour steps because it can be
  // picked up from after the rename prompt
  {
    id: 'coastmix-practice-15',
    title: 'Scenario complete!',
    text: `<p>Congratulations &mdash; you did it!</p>
      <p>
        You've prepared for 2030 sea level rise, but can you prepare for
        2050 and beyond? Now that you've learned the basics of Coastmix,
        try changing the sea level rise projection year, or a start with a
        different coastal environment, and see what you can come up with!
      </p>`,
    classes: 'tour-dialog',
    buttons: [
      {
        classes: 'btn btn-primary shepherd-btn-center',
        text: 'Explore Coastmix',
        action() {
          ;(this as unknown as Tour).complete()
        },
      },
    ],
  },
]
