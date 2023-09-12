import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from './index'

// Pre-type the `createAsyncThunk` method
// This is in a separate module to resolve a `can't access lexical declaration
// 'X' before initialization error that occurs if it were placed in `./index.ts`
// https://redux-toolkit.js.org/usage/usage-with-typescript/#defining-a-pre-typed-createasyncthunk
export const createAsyncThunkTyped = createAsyncThunk.withTypes<{
  state: RootState
}>()
