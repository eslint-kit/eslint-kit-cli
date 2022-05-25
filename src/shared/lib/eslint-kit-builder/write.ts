import j from 'jscodeshift'
import { writeFile } from '../fs'
import { Config } from './builders'

export function writeEslintKitConfig(config: Config) {
  const source = j(config).toSource()
  return writeFile('.eslintrc.js', source)
}
