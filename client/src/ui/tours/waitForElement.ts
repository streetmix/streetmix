export type WaitForElementOpts = {
  timeoutMs?: number
  root?: ParentNode // default document
  pollMs?: number // if you prefer polling
}

export function waitFor(milliseconds: number) {
  return new Promise((resolve) =>
    window.setTimeout(() => resolve(milliseconds), milliseconds)
  )
}

// run raf a few times for animation to stabilize
export async function waitForAnimation() {
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  return new Promise(requestAnimationFrame)
}

export function waitForElement(
  selector: string,
  { timeoutMs = 3000, root = document }: WaitForElementOpts = {}
): Promise<HTMLElement> {
  const existing = root.querySelector(selector)
  if (existing) return Promise.resolve(existing as HTMLElement)

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timed out waiting for element: ${selector}`))
    }, timeoutMs)

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector)
      if (el) {
        window.clearTimeout(timeout)
        observer.disconnect()
        resolve(el as HTMLElement)
      }
    })

    observer.observe(
      root === document ? document.documentElement : (root as Node),
      {
        childList: true,
        subtree: true,
      }
    )
  })
}
