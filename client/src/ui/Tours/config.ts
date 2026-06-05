import { shift } from '@floating-ui/dom'

export const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    floatingUIOptions: {
      middleware: [
        shift({ padding: 10 }), // Don't have popups flush to viewport edge
      ],
    },
  },
  useModalOverlay: true,
}
