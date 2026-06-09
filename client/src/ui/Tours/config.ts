import { offset, shift } from '@floating-ui/dom'

export const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    floatingUIOptions: {
      middleware: [
        offset(10),
        shift({ padding: 10 }), // Don't have popups flush to viewport edge
      ],
    },
  },
  useModalOverlay: true,
}
