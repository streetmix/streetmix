import { getSlopeValues } from '~/src/segments/slope.js'
import { waitFor, waitForElement } from './waitForElement.js'
import { watchTourStateForStep } from './stateAdvance.js'

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

const FLOAT_COMPARISON_EPSILON = 0.001

let stopPracticeStep10Listener: (() => void) | undefined
let stopPracticeStep13Listener: (() => void) | undefined

function teardownStep10Listener() {
  stopPracticeStep10Listener?.()
  stopPracticeStep10Listener = undefined
}

function teardownStep13Listener() {
  stopPracticeStep13Listener?.()
  stopPracticeStep13Listener = undefined
}

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
    title: 'New waterfront',
    text: `To start, click the “New waterfront” menu.`,
    attachTo: {
      element: '#menubar-new',
      on: 'bottom',
    },
    highlightClass: 'tour-highlight',
    advanceOn: {
      event: 'click',
      selector: '#menubar-new',
    },
    buttons: [backButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-02b',
    title: 'Select a template',
    text: `Select the “Harborwalk” template. This will open a new starting
      street in a new browser tab.`,
    attachTo: {
      element: '[data-tour-id="new-street-harborwalk"]',
      on: 'left',
    },
    highlightClass: 'tour-highlight',
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="new-street-harborwalk"]',
    },
    buttons: [backButton],
    beforeShowPromise: async () => {
      await waitFor(300)
    },
  },
  {
    id: 'coastmix-practice-03',
    title: 'A new tab has opened',
    text: `Your new “Harborwalk” template has opened in another browser tab. Switch to that tab to continue with the practice scenario.`,
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
    title: 'Open flooding controls',
    text: `Click “Coastal Flooding” to access and adjust flood features.`,
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
  },
  {
    // assuming not already selected
    id: 'coastmix-practice-05',
    title: 'Choose sea level rise',
    text: `Next, select 2030 sea level rise.`,
    attachTo: {
      element: '[data-tour-id="2030-sea-level-rise"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    advanceOn: {
      event: 'click',
      selector: '[data-tour-id="2030-sea-level-rise"]',
    },
    buttons: [backButton],
    beforeShowPromise: async () => {
      await waitForElement('.coastmix-controls')
      await waitFor(300)
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-06',
    title: 'Toggle storm surge',
    text: `For an extra challenge, you can turn on storm surge. This is totally
      optional, though!`,
    attachTo: {
      element: '[data-tour-id="storm-surge-control"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    buttons: [backButton, nextButton],
    ...modalOverlayOptions,
    // Make the position of this a lil prettier, because the control is not
    // vertically centered
    modalOverlayOpeningYOffset: -1,
  },
  {
    id: 'coastmix-practice-08',
    title: 'Flooding!',
    text: `Oh no! You can see that our harborwalk environment is flooded.
      There are many ways to protect against future sea level rise, but for
      this scenario, we’ll be building an elevated harborwalk with a sloped
      berm.`,
    attachTo: {
      element: '[data-tour-id="flooding-message"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    buttons: [backButton, nextButton],
  },
  {
    id: 'coastmix-practice-09',
    title: 'Select the harborwalk',
    text: `First, click on the “Harborwalk” feature next to the
      water.`,
    attachTo: {
      element: '[data-slice-label="Harborwalk"]',
      on: 'bottom',
    },
    highlightClass: 'tour-highlight',
    advanceOn: {
      event: 'click',
      selector: '[data-slice-label="Harborwalk"]',
    },
    buttons: [backButton],
    scrollTo: {
      behavior: 'smooth',
      inline: 'center',
      block: 'end',
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-10',
    title: 'Raise the harborwalk',
    text: `Elevate the Harborwalk feature until it blocks the flood waters.`,
    attachTo: {
      element: '[data-tour-id="elevation-control"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    buttons: [backButton],
    beforeShowPromise: async () => {
      await waitForElement('.popup-container')
      await waitFor(300)
    },
    when: {
      show() {
        const stepTour = (this as unknown as { tour?: Tour }).tour ?? null

        teardownStep10Listener()
        stopPracticeStep10Listener = watchTourStateForStep({
          stepId: 'coastmix-practice-10',
          getActiveTour: () => stepTour,
          select: (state) => state.coastmix,
          shouldAdvance: (coastmix) => {
            if (coastmix.seaLevelRise === 0) return false
            if (
              coastmix.floodDistance[0] === null &&
              coastmix.floodDistance[1] === null
            ) {
              return false
            }

            return !coastmix.floodDistance.includes('max')
          },
        })
      },
      hide() {
        teardownStep10Listener()
      },
    },
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-11',
    title: 'Nice!',
    text: `Sea level rise and storm surge
      are now addressed by elevating the Harborwalk, but the public realm
      behind it needs to be integrated into this new condition.`,
    buttons: [backButton, nextButton],
    attachTo: {
      element: '[data-tour-id="flooding-message"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
  },
  {
    id: 'coastmix-practice-12',
    title: 'Select the berm',
    text: `Click on the feature called Berm.”`,
    attachTo: {
      element: '[data-slice-label="Berm"]',
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
      selector: '[data-slice-label="Berm"]',
    },
    buttons: [backButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-13',
    title: 'Raise berm',
    text: `Raise the berm on the right side to meet the height of the harborwalk element.`,
    attachTo: {
      element: '[data-tour-id="slope-control-group"]',
      on: 'top',
    },
    highlightClass: 'tour-highlight',
    buttons: [backButton],
    when: {
      show() {
        const stepTour = (this as unknown as { tour?: Tour }).tour ?? null

        teardownStep13Listener()
        stopPracticeStep13Listener = watchTourStateForStep({
          stepId: 'coastmix-practice-13',
          getActiveTour: () => stepTour,
          select: (state) => {
            const segmentIndex = state.ui.activeSegment

            if (typeof segmentIndex !== 'number' || segmentIndex < 0) {
              return null
            }

            const selectedSegment = state.street.segments[segmentIndex]
            if (!selectedSegment) {
              return null
            }

            const rightSlopeValue = selectedSegment.slope.values[1]
            const rightAdjacentElevation = getSlopeValues(
              state.street,
              segmentIndex
            )[1]

            return {
              rightSlopeValue,
              rightAdjacentElevation,
            }
          },
          shouldAdvance: (values) => {
            if (values === null) return false

            return (
              Math.abs(
                values.rightSlopeValue - values.rightAdjacentElevation
              ) <= FLOAT_COMPARISON_EPSILON
            )
          },
        })
      },
      hide() {
        teardownStep13Listener()
      },
    },
    ...modalOverlayOptions,
  },
  // {
  //   id: 'coastmix-practice-14',
  //   text: `Now our “Future berm” is a current berm! You can rename
  //     an element by clicking on the name here, and then type “Berm”
  //     in the subsequent popup window.`,
  //   attachTo: {
  //     element: '[data-tour-id="editable-label"]',
  //     on: 'top',
  //   },
  //   highlightClass: 'tour-highlight',
  //   advanceOn: {
  //     event: 'click',
  //     selector: '[data-tour-id="editable-label"]',
  //   },
  //   buttons: [backButton],
  //   ...modalOverlayOptions,
  // },
  // Conclusion dialog is integrated into tour steps because it can be
  // picked up from after the rename prompt
  {
    id: 'coastmix-practice-15',
    title: 'Scenario complete!',
    text: `<p>Congratulations &mdash; you did it!</p>
      <p>
        You've prepared for 2030 sea level rise, but can you prepare for
        2050 and beyond? Now that you've learned the basics of Coastmix,
        try changing the sea level rise projection year, or start with a
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
