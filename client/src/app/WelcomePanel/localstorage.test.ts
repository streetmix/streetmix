import {
  setIsReturningUser,
  getIsReturningUser,
  LOCAL_STORAGE_RETURNING_USER,
} from './localstorage.js'

describe('returning user memory for WelcomePanel', () => {
  // Ensure that we are setting values to localStorage by spying on it
  const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
  const getItemSpy = vi.spyOn(window.localStorage, 'getItem')

  // Reset state between tests
  afterEach(() => {
    localStorage.clear()
    setItemSpy.mockClear()
    getItemSpy.mockClear()
  })

  describe('setIsReturningUser', () => {
    it('sets value in localStorage', () => {
      setIsReturningUser()

      expect(setItemSpy).toHaveBeenCalledWith(
        LOCAL_STORAGE_RETURNING_USER,
        'true'
      )
      expect(getIsReturningUser()).toStrictEqual(true)
    })
  })

  describe('getIsReturningUser', () => {
    it('returns true for a returning user', () => {
      localStorage.setItem(LOCAL_STORAGE_RETURNING_USER, 'true')

      expect(getIsReturningUser()).toStrictEqual(true)
      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_RETURNING_USER)
    })

    it('returns false for a new user', () => {
      expect(getIsReturningUser()).toStrictEqual(false)
      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_RETURNING_USER)
    })
  })
})
