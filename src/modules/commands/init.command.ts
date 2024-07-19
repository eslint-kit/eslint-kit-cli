import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import { Command, CommandRunner } from 'nest-commander'
import {
  createEslintKitBuilder,
  Preset,
} from '@app/shared/lib/eslint-kit-builder'
import { removeFile } from '@app/shared/lib/fs'
import { AbstractPackageManager } from '@app/shared/lib/package-managers'
import { ProjectDependency } from '../../shared/lib/package-managers/types'
import { Versions } from '../../shared/versions'
import { EslintKitApiService } from '../eslint-kit-api'
import { MetaService } from '../meta'
import { InjectPackageManager } from '../package-manager'
import {
  askAboutPackageJsonScripts,
  askForPrettierOverride,
  askForReplacePermission,
  confirmDependencies,
} from './init.questions'

@Command({
  name: 'init',
  description: 'Set up initial eslint-kit configuration',
  options: { isDefault: true },
})
export class InitCommand implements CommandRunner {
  constructor(
    @InjectPackageManager() private manager: AbstractPackageManager,
    private meta: MetaService,
    private eslintKitAPI: EslintKitApiService,
  ) {}

  async run() {
    const packageJson = await this.meta.readPackageJson()

    const eslintConfigLocation = await this.meta.findEslintConfigLocation()

    if (eslintConfigLocation) {
      const canReplace = await askForReplacePermission()
      if (!canReplace) return
    }

    const prettierLocation = await this.meta.findPrettierConfigLocation()
    const canWritePrettier =
      !prettierLocation || (await askForPrettierOverride())

    const hasLintScripts = Boolean(
      packageJson.scripts?.lint || packageJson.scripts?.['lint:fix'],
    )

    const canAddLintScripts = hasLintScripts
      ? await askAboutPackageJsonScripts('replace')
      : await askAboutPackageJsonScripts('add')

    const dependenciesToDelete = await this.meta.findOverlappingDependencies()

    if (await this.meta.hasEslint()) {
      dependenciesToDelete.push('eslint')
    }

    if (await this.meta.hasEslintKit()) {
      dependenciesToDelete.push('eslint-kit')
    }

    const dependenciesToInstall: ProjectDependency[] = [
      { name: `eslint-kit@${Versions.ESLintKit}` },
      { name: `eslint@${Versions.ESLint}` },
      { name: `prettier@${Versions.Prettier}` },
    ]

    console.info()
    console.info(
      chalk.hex('#ffffff').bgRed(' Will delete dependencies: '),
      ...dependenciesToDelete.map((name) => chalk.red(`\n- ${name}`)),
    )

    console.info()
    console.info(
      chalk.hex('#ffffff').bgGreen(' Will install dependencies: '),
      ...dependenciesToInstall.map(({ name }) => chalk.green(`\n+ ${name}`)),
    )

    console.info()
    const proceed = await confirmDependencies()
    if (!proceed) return
    console.info()

    if (dependenciesToDelete.length > 0) {
      await this.manager.delete(dependenciesToDelete)
    }

    await this.manager.addDevelopment(dependenciesToInstall)

    if (canWritePrettier) {
      const writePrettierRecommended = async () => {
        const recommended = await this.eslintKitAPI.fetchPrettierRecommended()
        const location = path.resolve(process.cwd(), '.prettierrc')
        await fs.writeFile(location, JSON.stringify(recommended, null, 2))
      }

      if (!prettierLocation) {
        await writePrettierRecommended()
      } else if (prettierLocation === 'package.json') {
        const recommended = await this.eslintKitAPI.fetchPrettierRecommended()
        await this.meta.updatePackageJsonField('prettier', recommended)
      } else {
        const old = path.resolve(process.cwd(), prettierLocation)
        await fs.unlink(old)
        await writePrettierRecommended()
      }
    }

    const builder = createEslintKitBuilder()

    const presets: Preset[] = []
    const extensions: Set<string> = new Set()
    const directories: Set<string> = new Set(['src'])

    presets.push(builder.preset('imports'))
    presets.push(builder.preset('node'))
    presets.push(builder.preset('prettier'))

    extensions.add('js').add('mjs').add('cjs')

    if (await this.meta.hasTypeScript()) {
      presets.push(builder.preset('typescript', { enforceUsingType: true }))
      extensions.add('ts').add('mts')
    }

    if (await this.meta.hasReact()) {
      presets.push(builder.preset('react'))
      extensions.add('jsx')

      if (await this.meta.hasTypeScript()) {
        extensions.add('tsx')
      }
    }

    if (await this.meta.hasNextJs()) {
      presets.push(builder.preset('nextJs'))
      directories.add('pages').add('app').add('lib')
    }

    if (await this.meta.hasRemix()) {
      presets.push(builder.preset('remix'))
      directories.add('app').add('server')
    }

    if (await this.meta.hasVue()) {
      presets.push(builder.preset('vue'))
      extensions.add('vue')
    }

    if (await this.meta.hasSolidJs()) {
      presets.push(builder.preset('solidJs'))
      extensions.add('jsx')

      if (await this.meta.hasTypeScript()) {
        extensions.add('tsx')
      }
    }

    if (await this.meta.hasSvelte()) {
      presets.push(builder.preset('svelte'))
      extensions.add('svelte')
    }

    if (await this.meta.hasEffector()) {
      presets.push(builder.preset('effector'))
    }

    if (canAddLintScripts) {
      const scripts = packageJson.scripts ?? {}
      const dir = Array.from(directories).join(',')
      const ext = Array.from(extensions).join(',')
      const dirGlob = directories.size > 1 ? `{${dir}}` : dir
      const extGlob = extensions.size > 1 ? `{${ext}}` : ext
      const glob = `"${dirGlob}/**/*.${extGlob}"`
      scripts.lint = `eslint ${glob}`
      scripts['lint:fix'] = `eslint ${glob} --fix`
      await this.meta.updatePackageJsonField('scripts', scripts)
    }

    const eslintConfig = builder.config([
      builder.allowDebugFromEnv(),
      builder.presets(presets),
    ])

    /*
     * Remove existing ESLint configuration
     */
    if (eslintConfigLocation === 'package.json') {
      await this.meta.updatePackageJsonField('eslintConfig', undefined)
    } else if (eslintConfigLocation) {
      await removeFile(eslintConfigLocation)
    }

    const eslintrcName =
      packageJson.type === 'module' ? '.eslintrc.cjs' : '.eslintrc.js'

    await builder.write(eslintConfig, eslintrcName)

    try {
      if (this.manager.name === 'NPM') {
        console.info()
        console.info(
          chalk.yellow(
            `Cannot lint ${eslintrcName} using npm. You may do it manually or use yarn / pnpm`,
          ),
        )
      } else {
        await this.manager.run(['eslint', '--no-ignore', '--fix', eslintrcName])
      }
    } catch {
      console.info()
      console.info(
        chalk.red(
          `Failed to lint ${eslintrcName}.` +
            ` Most likely it's the monorepo / typescript issue -` +
            ` please inspect the error and check out Common Issues section:` +
            ` https://github.com/eslint-kit/eslint-kit#common-issues`,
        ),
      )
    }

    console.info()
    console.info(
      chalk.green('ESLint Kit installation is complete. Happy usage!'),
    )

    console.info()
    console.info(
      chalk.yellow(
        'To learn how to configure your editor for using with ESLint, check this out:',
      ),
      'https://github.com/eslint-kit/eslint-kit/tree/release#setting-up-editors',
    )
  }
}
