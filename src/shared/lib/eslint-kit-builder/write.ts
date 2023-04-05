import { writeFile } from '../fs'
import { Config, toSource } from './builders'

export function writeEslintKitConfig(config: Config, fileName: string) {
  const source = toSource(config)
  return writeFile(fileName, source)
}
