import store from '~/src/store'
import { stopTour } from '~/src/store/slices/app.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
// import { waitFor, waitForElement } from './waitForElement.js'

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

export const steps: StepOptions[] = [
  {
    id: 'coastmix-practice-01',
    text: 'In this practice scenario, you will address 2030 sea level rise with storm surge.',
    classes: 'tour-medium-width',
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
    // Only show this step if the coastal flooding panel isn't already open
    showOn() {
      const coastmix = store.getState().coastmix
      return !coastmix.controlsVisible
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
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-05',
    text: `For an extra challenge, you can turn on storm surge.`,
    attachTo: {
      element: '[data-tour-id="storm-surge-control"]',
      on: 'bottom',
    },
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-06',
    text: `Set the flood direction to “Right,” which is the location of the waterfront
      in this environment.`,
    attachTo: {
      element: '[data-tour-id="flood-direction-control"]',
      on: 'right',
    },
    // TODO: advance on selection
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-07',
    text: `Now, let’s build an elevated Harborwalk with a sloped berm. First, click
      on the feature next to the water called “Harborwalk.”`,
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-08a',
    text: `Elevate the Harborwalk feature to 2 feet. If you turned on storm surge,
      you may need to elevate it a little more.`,
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    // TODO: actiate on successful scenario addrressing.
    id: 'coastmix-practice-08b',
    text: `Sea level rise and storm surge
      are now addressed by elevating the Harborwalk, but the public realm
      behind it needs to be integrated into this new condition.`,
    buttons: [nextButton],
    ...modalOverlayOptions,
  },
  {
    id: 'coastmix-practice-9',
    text: `Click on the feature called “Future berm.”`,
    buttons: [nextButton],
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
