import {
  type TypedUseSelectorHook,
  useDispatch as useBaseDispatch,
  useSelector as useBaseSelector
} from 'react-redux'
import type { RootState, Dispatch } from './index'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type DispatchFunc = () => Dispatch

export const useDispatch: DispatchFunc = useBaseDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useBaseSelector
