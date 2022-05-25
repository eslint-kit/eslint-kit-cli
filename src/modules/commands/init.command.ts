import fs from 'fs/promises'
import path from 'path'
import { Command, CommandRunner } from 'nest-commander'
import {
  createEslintKitBuilder,
  Preset,
} from '@app/shared/lib/eslint-kit-builder'
import { readJson, removeFile, writeFile } from '@app/shared/lib/fs'
import { AbstractPackageManager } from '@app/shared/lib/package-managers'
import { EslintKitApiService } from '../eslint-kit-api'
import { MetaService } from '../meta'
import { InjectPackageManager } from '../package-manager'
import { askForReplacePermission } from './init.questions'

@Command({
  name: 'init',
  description: 'Set up initial eslint-kit configuration',
  options: { isDefault: true },
})
export class InitCommand implements CommandRunner {
  constructor(
    @InjectPackageManager() private manager: AbstractPackageManager,
    private meta: MetaService,
    private eslintKitAPI: EslintKitApiService
  ) {}

  async run() {
    const eslintConfigLocation = await this.meta.findEslintConfigLocation()

    if (eslintConfigLocation) {
      const canReplace = await askForReplacePermission()
      if (!canReplace) return
    }

    const hasEslintKit = await this.meta.hasEslintKit()

    if (!hasEslintKit)
      await this.manager.addDevelopment([
        { name: 'eslint-kit', version: 'latest' },
      ])

    const hasPrettierConfig = await this.meta.hasPrettierConfig()

    if (!hasPrettierConfig) {
      const recommended = await this.eslintKitAPI.fetchPrettierRecommended()
      const location = path.resolve(process.cwd(), '.prettierrc')
      await fs.writeFile(location, JSON.stringify(recommended, null, 2))
    }

    const builder = createEslintKitBuilder()

    const presets: Preset[] = []

    presets.push(builder.preset('node'))
    presets.push(builder.preset('prettier'))

    if (await this.meta.hasTypeScript()) {
      presets.push(builder.preset('typescript'))
    }

    if (await this.meta.hasReact()) {
      presets.push(builder.preset('react'))
    }

    if (await this.meta.hasNextJs()) {
      presets.push(builder.preset('nextJs'))
    }

    if (await this.meta.hasVue()) {
      presets.push(builder.preset('vue'))
    }

    if (await this.meta.hasSolidJs()) {
      presets.push(builder.preset('solidJs'))
    }

    if (await this.meta.hasSvelte()) {
      presets.push(builder.preset('svelte'))
    }

    if (await this.meta.hasEffector()) {
      presets.push(builder.preset('effector'))
    }

    if (await this.meta.hasAliases()) {
      presets.push(builder.preset('alias'))
    }

    const eslintConfig = builder.config([builder.presets(presets)])

    /*
     * Remove existing ESLint configuration
     */
    if (eslintConfigLocation === 'package.json') {
      const packageJson = await readJson('package.json')
      delete packageJson?.eslintConfig
      await writeFile('package.json', JSON.stringify(packageJson, null, 2))
    } else if (eslintConfigLocation) {
      await removeFile(eslintConfigLocation)
    }

    await builder.write(eslintConfig)
  }
}
