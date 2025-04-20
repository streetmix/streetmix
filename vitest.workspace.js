/// <reference types="vitest" />
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'client/vitest.config.ts',
  'packages/utils/vitest.config.ts'
])
