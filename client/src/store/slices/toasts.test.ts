import { vi } from 'vitest'
import toasts, { addToast, destroyToast } from './toasts'

describe('toasts reducer', () => {
  it('should handle addToast()', () => {
    // Set fake time to 0
    const date = 0
    vi.useFakeTimers()
    vi.setSystemTime(date)

    const action1 = toasts(
      [],
      addToast({
        message: 'Toast message!'
      })
    )

    const result1 = [
      {
        message: 'Toast message!',
        timestamp: 0
      }
    ]

    expect(action1).toEqual(result1)

    // Advance fake time by 30ms
    vi.setSystemTime(date + 30)

    const action2 = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 0
        }
      ],
      addToast({
        component: 'TOAST_UNDO',
        method: 'success',
        action: 'Foo button',
        message: 'Toast message 2',
        duration: 2000
      })
    )

    const result2 = [
      {
        message: 'Toast message!',
        timestamp: 0
      },
      {
        component: 'TOAST_UNDO',
        method: 'success',
        action: 'Foo button',
        message: 'Toast message 2',
        duration: 2000,
        timestamp: 30
      }
    ]

    expect(action2).toEqual(result2)

    // Advance fake time by another 30ms (60s since start of 0)
    vi.setSystemTime(date + 60)

    const action3 = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 0
        },
        {
          component: 'TOAST_UNDO',
          method: 'warning',
          action: 'Foo button',
          duration: 2000,
          timestamp: 30
        }
      ],
      addToast({
        message: 'Toast message 3',
        title: 'Achievement unlocked!',
        method: 'success'
      })
    )

    const result3 = [
      {
        message: 'Toast message!',
        timestamp: 0
      },
      {
        component: 'TOAST_UNDO',
        method: 'warning',
        action: 'Foo button',
        duration: 2000,
        timestamp: 30
      },
      {
        message: 'Toast message 3',
        title: 'Achievement unlocked!',
        method: 'success',
        timestamp: 60
      }
    ]

    expect(action3).toEqual(result3)

    vi.useRealTimers()
  })

  it('should handle destroyToast()', () => {
    const action = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 1
        },
        {
          component: 'TOAST_UNDO',
          method: 'warning',
          action: 'Foo button',
          duration: 2000,
          timestamp: 2
        },
        {
          message: 'Toast message 3',
          title: 'Achievement unlocked!',
          method: 'success',
          timestamp: 3
        }
      ],
      destroyToast(2)
    )

    const result = [
      {
        message: 'Toast message!',
        timestamp: 1
      },
      {
        message: 'Toast message 3',
        title: 'Achievement unlocked!',
        method: 'success',
        timestamp: 3
      }
    ]

    expect(action).toEqual(result)
  })
})
