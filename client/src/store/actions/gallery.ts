import { createAsyncThunk } from '@reduxjs/toolkit'

import { ERRORS, showError } from '../../app/errors.js'
import { onWindowFocus } from '../../app/event_handlers/focus.js'
import { MODES, getMode, setMode } from '../../app/mode.js'
import { updatePageUrl } from '../../app/page_url.js'
import { fetchGalleryData, fetchGalleryPageData } from '../../gallery/index.js'

import type { RootState } from '../index.js'

export const openGallery = createAsyncThunk(
  'gallery/openGallery',
  async (
    { userId, page = 1 }: { userId: string | null; page?: number },
    { rejectWithValue }
  ) => {
    updatePageUrl(true, userId)

    // TODO: Handle modes better.
    if (
      getMode() === MODES.USER_GALLERY ||
      getMode() === MODES.GLOBAL_GALLERY
    ) {
      // Prevents showing old street before the proper street loads
      showError(ERRORS.NO_STREET, false)
    }

    // Fetch data and catch errors if fetch goes wrong
    try {
      const data = await fetchGalleryData(userId ?? '', page)
      return data
    } catch (error: unknown) {
      // If the server error is 404, special rejection value
      // to display a "not-found" screen without the gallery
      if (error.response?.status === 404) {
        return rejectWithValue({
          killGallery: true,
        })
      }

      // Re-throw original error for normal rejection
      throw error
    }
  }
)

// This just fetches a new page of gallery data, do not do mode changes, etc
export const fetchGalleryPage = createAsyncThunk<
  Awaited<ReturnType<typeof fetchGalleryData>>,
  number,
  { state: RootState }
>('gallery/fetchPage', async (page: number, { rejectWithValue, getState }) => {
  const userId = getState().gallery.userId

  try {
    return await fetchGalleryPageData(userId ?? '', page)
  } catch (error: unknown) {
    if (error.response?.status === 404) {
      return rejectWithValue({
        userId,
        page,
      })
    }

    throw error
  }
})

export const closeGallery = createAsyncThunk<
  { instant: boolean },
  { instant?: boolean } | undefined,
  { state: RootState }
>(
  'gallery/closeGallery',
  async ({ instant = false } = {}, { getState }) => {
    const state = getState()

    if (!state.errors.abortEverything) {
      updatePageUrl()
    }

    onWindowFocus()
    setMode(MODES.CONTINUE)

    return { instant }
  },
  {
    condition: (arg, { getState }) => {
      const { visible } = getState().gallery

      // If gallery isn't visible, don't dispatch again
      if (!visible) {
        return false
      }
    },
  }
)
