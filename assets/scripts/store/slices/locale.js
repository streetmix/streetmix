import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DEFAULT_LOCALE } from '../../locales/constants'
import { getAppTranslations, getSegmentTranslations } from '../../util/api'

// Flattens a nested object from translation response, e.g.
// { key1: { key2: "string" }} => { "key1.key2": "string" }
// This is because react-intl expects to look up translations this way.
// ES6-ported function from https://gist.github.com/penguinboy/762197
// Ignores arrays and passes them through unchanged.
// Does not address null values, since the responses from the server will not be containing those.
function flattenObject (obj) {
  const toReturn = {}
  let flatObject
  Object.keys(obj).forEach((i) => {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      flatObject = flattenObject(obj[i])
      Object.keys(flatObject).forEach((x) => {
        toReturn[i + '.' + x] = flatObject[x]
      })
    } else {
      toReturn[i] = obj[i]
    }
  })
  return toReturn
}

export const changeLocale = createAsyncThunk(
  'locale/changeLocale',
  async (locale, thunkAPI) => {
    const messages = await getAppTranslations(locale)
    const segmentInfo = await getSegmentTranslations(locale)

    return {
      locale,
      translation: {
        messages: messages.data,
        segmentInfo: segmentInfo.data
      }
    }
  }
)

const localeSlice = createSlice({
  name: 'locale',
  initialState: {
    locale: DEFAULT_LOCALE,
    messages: {},
    segmentInfo: {},
    isLoading: false,
    requestedLocale: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(changeLocale.pending, (state, action) => {
        state.isLoading = true
        state.requestedLocale = action.meta.arg
      })

      .addCase(changeLocale.fulfilled, (state, action) => {
        const { locale, translation } = action.payload
        const { messages, segmentInfo = {} } = translation

        state.locale = locale
        state.messages = flattenObject(messages)
        state.segmentInfo = flattenObject(segmentInfo)
        state.isLoading = false
        state.requestedLocale = null

        document.querySelector('html').lang = locale
      })

      .addCase(changeLocale.rejected, (state, action) => {
        state.isLoading = false
        state.requestedLocale = null
      })
  }
})

export default localeSlice.reducer
