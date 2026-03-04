import {
  setIsReturningUserInLocalStorage,
  getIsReturningUserFromLocalStorage,
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

  describe('setIsReturningUserInLocalStorage', () => {
    it('sets value in localStorage', () => {
      setIsReturningUserInLocalStorage()

      expect(setItemSpy).toHaveBeenCalledWith(
        LOCAL_STORAGE_RETURNING_USER,
        'true'
      )
      expect(getIsReturningUserFromLocalStorage()).toStrictEqual(true)
    })
  })

  describe('getIsReturningUserFromLocalStorage', () => {
    it('returns true for a returning user', () => {
      localStorage.setItem(LOCAL_STORAGE_RETURNING_USER, 'true')

      expect(getIsReturningUserFromLocalStorage()).toStrictEqual(true)
      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_RETURNING_USER)
    })

    it('returns false for a new user', () => {
      expect(getIsReturningUserFromLocalStorage()).toStrictEqual(false)
      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_RETURNING_USER)
    })
  })
})
