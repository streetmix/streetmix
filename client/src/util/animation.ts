type FrameTickerListener = (frameTime: number, frameDuration: number) => void

// Frame ticker helper module
// original from rain demo by Caleb Miller
// https://codepen.io/MillerTime/pen/oXmgJe
// refactored to Typescript + modern JS class with private fields
// this only has two public methods: `addListener` and `clearListeners`
export class FrameTicker {
  #started = false
  #last_timestamp = 0
  #listeners: FrameTickerListener[] = []

  // will call function reference repeatedly once registered, passing elapsed time and a lag multiplier as parameters
  addListener(fn: FrameTickerListener) {
    if (typeof fn !== 'function')
      throw 'FrameTicker.addListener() requires a function reference passed in.'

    this.#listeners.push(fn)

    // start frame-loop lazily
    if (!this.#started) {
      this.#started = true
      this.#queueFrame()
    }
  }

  clearListeners() {
    this.#listeners = []
    this.#started = false
    this.#last_timestamp = 0
  }

  // queue up a new frame (calls frameHandler)
  #queueFrame() {
    if (typeof window.requestAnimationFrame !== 'undefined') {
      window.requestAnimationFrame((t) => this.#frameHandler(t))
    }
  }

  #frameHandler(timestamp: number) {
    let frame_time = timestamp - this.#last_timestamp
    this.#last_timestamp = timestamp

    // make sure negative time isn't reported (first frame can be whacky)
    if (frame_time < 0) {
      // frame_time = 17 // 60fps
      // use 30fps for better performance
      frame_time = 33 // 30fps
    }
    // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
    else if (frame_time > 68) {
      frame_time = 68
    }

    // fire custom listeners
    for (let i = 0, len = this.#listeners.length; i < len; i++) {
      this.#listeners[i].call(window, frame_time, frame_time / 16.67)
    }

    // always queue another frame (if started)
    if (this.#started) {
      this.#queueFrame()
    }
  }
}
