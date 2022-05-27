import { writeFile } from '../fs'
import { Config, toSource } from './builders'

export function writeEslintKitConfig(config: Config) {
  const source = toSource(config)
  return writeFile('.eslintrc.js', source)
}
