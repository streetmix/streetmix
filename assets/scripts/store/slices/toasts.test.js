/* eslint-env jest */
import { advanceTo, advanceBy, clear } from 'jest-date-mock'
import toasts, { addToast, destroyToast } from './toasts'

describe('toasts reducer', () => {
  it('should handle initial state', () => {
    expect(toasts(undefined, {})).toEqual([])
  })

  it('should handle addToast()', () => {
    advanceTo(0)

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

    advanceBy(30)

    const action2 = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 0
        }
      ],
      addToast({
        component: 'COMPONENT_NAME',
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
        component: 'COMPONENT_NAME',
        method: 'success',
        action: 'Foo button',
        message: 'Toast message 2',
        duration: 2000,
        timestamp: 30
      }
    ]

    expect(action2).toEqual(result2)

    advanceBy(30)

    const action3 = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 0
        },
        {
          component: 'COMPONENT_NAME',
          method: 'warning',
          action: 'Foo button',
          message: 'Toast message 2',
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
        component: 'COMPONENT_NAME',
        method: 'warning',
        action: 'Foo button',
        message: 'Toast message 2',
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

    clear()
  })

  it('should handle destroyToast()', () => {
    const action = toasts(
      [
        {
          message: 'Toast message!',
          timestamp: 1
        },
        {
          component: 'COMPONENT_NAME',
          method: 'warning',
          action: 'Foo button',
          message: 'Toast message 2',
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
