import {
  useDispatch as useBaseDispatch,
  useSelector as useBaseSelector
} from 'react-redux'
import type { RootState, Dispatch } from './index'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = useBaseDispatch.withTypes<Dispatch>()
export const useSelector = useBaseSelector.withTypes<RootState>()
