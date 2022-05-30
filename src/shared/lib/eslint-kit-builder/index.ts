import * as transforms from './builders'
import { writeEslintKitConfig } from './write'

export const createEslintKitBuilder = () => ({
  ...transforms,
  write: writeEslintKitConfig,
})

export type { Config, Preset } from './builders'
