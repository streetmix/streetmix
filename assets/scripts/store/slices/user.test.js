/* eslint-env jest */
import user, {
  setSignInData,
  clearSignInData,
  setGeolocationAttempted,
  setGeolocationData,
  rememberUserProfile
} from './user'

describe('user reducer', () => {
  const initialState = {
    signInData: null,
    signedIn: false,
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
      geolocation: {
        attempted: false,
        data: {}
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
