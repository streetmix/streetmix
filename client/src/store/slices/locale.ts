import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { DEFAULT_LOCALE } from '../../locales/constants'
import { getAppTranslations, getSegmentTranslations } from '../../util/api'

type LocaleMessages = Record<string, string | string[]>

interface LocaleState {
  locale: string
  messages: LocaleMessages
  segmentInfo: LocaleMessages
  isLoading: boolean
  requestedLocale: string | null
}

const initialState: LocaleState = {
  locale: DEFAULT_LOCALE,
  messages: {},
  segmentInfo: {},
  isLoading: false,
  requestedLocale: null
}

// Flattens a nested object from translation response, e.g.
// { key1: { key2: "string" }} => { "key1.key2": "string" }
// This is because react-intl expects to look up translations this way.
// ES6-ported function from https://gist.github.com/penguinboy/762197
// Ignores arrays and passes them through unchanged.
// Does not address null values, since the responses from the server will not be containing those.
// type NestedObjectValues = string | string[] | Record<string, NestedObjectValues>

type NestedObjectValues = string | string[] | NestedStringObject
interface NestedStringObject extends Record<string, NestedObjectValues> {}

function flattenObject (obj: NestedObjectValues): LocaleMessages {
  const toReturn: LocaleMessages = {}
  let flatObject: LocaleMessages
  Object.keys(obj).forEach((i: string) => {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      flatObject = flattenObject(obj[i])
      Object.keys(flatObject).forEach((x: string) => {
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
  async (locale: string) => {
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
  initialState,

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

        const el = document.querySelector('html')
        if (el) {
          el.lang = locale
        }
      })

      .addCase(changeLocale.rejected, (state) => {
        state.isLoading = false
        state.requestedLocale = null
      })
  }
})

export default localeSlice.reducer
