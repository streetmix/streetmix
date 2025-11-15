declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const value: string
  export default value
}

// This is bare-bones.
// See also: https://github.com/dacioromero/types-wm
// and https://webmonetization.org/
// `document.monetization` has been implemented as an unmounted `<div>` element
export interface Monetization extends HTMLDivElement {
  state: 'stopped' | 'pending' | 'started'
}

// Add an optional `monetization` property on Document when Web Monetization
// API is supported or present.
declare global {
  interface Document {
    monetization?: Monetization
    // Deprecated coil polyfill interface
    coilMonetizationPolyfill?: {
      init: ({ btpToken: string }) => void
      refreshBtpToken: (btpToken: string) => void
    }
  }
}
