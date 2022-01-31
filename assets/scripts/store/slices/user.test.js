/* eslint-env jest */
import user, {
  setSignInData,
  clearSignInData,
  setGeolocationAttempted,
  setGeolocationData,
  setCoilPluginSubscriber,
  rememberUserProfile
} from './user'

describe('user reducer', () => {
  const initialState = {
    signInData: null,
    signedIn: false,
    isSubscriber: false,
    isCoilPluginSubscriber: false,
    geolocation: {
      attempted: false,
      data: null
    },
    profileCache: {}
  }

  it('should handle initial state', () => {
    expect(user(undefined, {})).toEqual(initialState)
  })

  it('should handle setSignInData()', () => {
    expect(
      user(
        initialState,
        setSignInData({
          details: {
            id: 'foo',
            profileImageUrl: 'image.gif',
            flags: {},
            roles: ['USER']
          }
        })
      )
    ).toEqual({
      signInData: {
        details: {
          id: 'foo',
          profileImageUrl: 'image.gif',
          flags: {},
          roles: ['USER']
        }
      },
      signedIn: true,
      isSubscriber: false,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: false,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle setSignInData() for subscribers', () => {
    expect(
      user(
        initialState,
        setSignInData({
          details: {
            id: 'foo',
            profileImageUrl: 'image.gif',
            flags: {},
            roles: ['USER', 'SUBSCRIBER_1']
          }
        })
      )
    ).toEqual({
      signInData: {
        details: {
          id: 'foo',
          profileImageUrl: 'image.gif',
          flags: {},
          roles: ['USER', 'SUBSCRIBER_1']
        }
      },
      signedIn: true,
      isSubscriber: true,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: false,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle clearSignInData()', () => {
    expect(
      user(
        {
          signInData: {
            details: {
              id: 'foo',
              profileImageUrl: 'image.gif',
              flags: {},
              roles: ['USER']
            }
          },
          signedIn: true,
          isSubscriber: true,
          isCoilPluginSubscriber: true,
          geolocation: {
            attempted: true,
            data: null
          },
          profileCache: {}
        },
        clearSignInData()
      )
    ).toEqual({
      signInData: null,
      signedIn: false,
      isSubscriber: false,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: true,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle setGeolocationAttempted()', () => {
    expect(user(initialState, setGeolocationAttempted(true))).toEqual({
      signInData: null,
      signedIn: false,
      isSubscriber: false,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: true,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle setGeolocationData()', () => {
    expect(user(initialState, setGeolocationData({}))).toEqual({
      signInData: null,
      signedIn: false,
      isSubscriber: false,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: false,
        data: {}
      },
      profileCache: {}
    })
  })

  it('should handle setCoilPluginSubscriber() for not-signed-in user', () => {
    expect(user(initialState, setCoilPluginSubscriber(true))).toEqual({
      signInData: null,
      signedIn: false,
      isSubscriber: false,
      isCoilPluginSubscriber: true,
      geolocation: {
        attempted: false,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle setCoilPluginSubscriber() for signed-in user', () => {
    expect(
      user(
        {
          ...initialState,
          signedIn: true
        },
        setCoilPluginSubscriber(true)
      )
    ).toEqual({
      signInData: null,
      signedIn: true,
      isSubscriber: true,
      isCoilPluginSubscriber: true,
      geolocation: {
        attempted: false,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle setCoilPluginSubscriber() for a user with subscriber role', () => {
    expect(
      user(
        {
          signInData: {
            details: {
              id: 'foo',
              profileImageUrl: 'image.gif',
              flags: {},
              roles: ['USER', 'SUBSCRIBER_1']
            }
          },
          signedIn: true,
          isSubscriber: true,
          isCoilPluginSubscriber: true,
          geolocation: {
            attempted: true,
            data: null
          },
          profileCache: {}
        },
        setCoilPluginSubscriber(false)
      )
    ).toEqual({
      signInData: {
        details: {
          id: 'foo',
          profileImageUrl: 'image.gif',
          flags: {},
          roles: ['USER', 'SUBSCRIBER_1']
        }
      },
      signedIn: true,
      isSubscriber: true,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: true,
        data: null
      },
      profileCache: {}
    })
  })

  it('should handle rememberUserProfile()', () => {
    expect(
      user(
        initialState,
        rememberUserProfile({
          id: 'foo',
          profileImageUrl: 'image.gif',
          flags: {},
          roles: ['USER']
        })
      )
    ).toEqual({
      signInData: null,
      signedIn: false,
      isSubscriber: false,
      isCoilPluginSubscriber: false,
      geolocation: {
        attempted: false,
        data: null
      },
      profileCache: {
        foo: {
          id: 'foo',
          profileImageUrl: 'image.gif',
          flags: {},
          roles: ['USER']
        }
      }
    })
  })
})
