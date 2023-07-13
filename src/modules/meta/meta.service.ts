import { Injectable } from '@nestjs/common'
import chalk from 'chalk'
import * as process from 'process'
import { hasFile, PackageJson, readJson, writeFile } from '@app/shared/lib/fs'
import { AbstractPackageManager } from '@app/shared/lib/package-managers'
import { EslintKitApiService } from '../eslint-kit-api'
import { InjectPackageManager } from '../package-manager'

@Injectable()
export class MetaService {
  constructor(
    @InjectPackageManager() private manager: AbstractPackageManager,
    private eslintKitAPI: EslintKitApiService,
  ) {}

  private async hasProdDependency(name: string) {
    const dependencies = await this.manager.getProduction()
    return dependencies.find((item) => item.name === name) !== undefined
  }

  private async hasDevDependency(name: string) {
    const dependencies = await this.manager.getDevelopment()
    return dependencies.find((item) => item.name === name) !== undefined
  }

  private async hasPeerDependency(name: string) {
    const dependencies = await this.manager.getPeer()
    return dependencies.find((item) => item.name === name) !== undefined
  }

  private async hasDependency(name: string) {
    const hasProd = await this.hasProdDependency(name)
    const hasPeer = await this.hasPeerDependency(name)
    const hasDev = await this.hasDevDependency(name)
    return hasProd || hasPeer || hasDev
  }

  private async hasRuntimeDependency(name: string) {
    const hasProd = await this.hasProdDependency(name)
    const hasPeer = await this.hasPeerDependency(name)
    return hasProd || hasPeer
  }

  public async hasReact() {
    return this.hasRuntimeDependency('react')
  }

  public async hasNextJs() {
    return this.hasRuntimeDependency('next')
  }

  public async hasRemix() {
    return this.hasRuntimeDependency('@remix-run/react')
  }

  public async hasVue() {
    return this.hasRuntimeDependency('vue')
  }

  public async hasSolidJs() {
    return this.hasRuntimeDependency('solid-js')
  }

  public async hasSvelte() {
    return this.hasRuntimeDependency('svelte')
  }

  public async hasEffector() {
    return this.hasRuntimeDependency('effector')
  }

  public async hasEslintKit() {
    return this.hasDependency('eslint-kit')
  }

  public async hasTypeScript() {
    return this.hasDependency('typescript')
  }

  public async hasEslint() {
    return this.hasDependency('eslint')
  }

  public async findEslintConfigLocation() {
    const packageJson = await readJson('package.json')

    if (packageJson?.eslintConfig) {
      return 'package.json' as const
    }

    const files = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yaml',
      '.eslintrc.yml',
    ] as const

    for (const file of files) {
      if (await hasFile(file)) return file
    }

    return null
  }

  public async readPackageJson(): Promise<PackageJson> {
    const packageJson = await readJson('package.json')

    if (!packageJson) {
      console.info()
      console.info(
        chalk.red(
          `Failed to find package.json.` +
            ` Please check your terminal session location`,
        ),
      )
      process.exit(1)
    }

    return packageJson
  }

  public async updatePackageJsonField<T extends keyof PackageJson>(
    field: T,
    value: PackageJson[T],
  ) {
    const json = await this.readPackageJson()
    delete json[field]
    json[field] = value

    const order: Array<keyof PackageJson> = [
      'scripts',
      'dependencies',
      'peerDependencies',
      'devDependencies',
      '_moduleAliases',
      'eslintConfig',
      'prettier',
    ]

    const byOrder = (a: keyof PackageJson, b: keyof PackageJson): number => {
      const orderA = order.indexOf(a)
      const orderB = order.indexOf(b)
      return orderA - orderB
    }

    function keysDeep(object: unknown) {
      const keys: string[] = []

      if (typeof object === 'object') {
        for (const key in object) {
          keys.push(key)
          keys.push(...keysDeep(object[key]))
        }
      }

      return keys
    }

    await writeFile(
      'package.json',
      JSON.stringify(json, keysDeep(json).sort(byOrder), 2),
    )
  }

  public async hasEslintConfig() {
    return (await this.findEslintConfigLocation()) !== null
  }

  public async findPrettierConfigLocation() {
    const packageJson = await this.readPackageJson()

    if (packageJson.prettier) {
      return 'package.json' as const
    }

    const files = [
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.prettierrc.config.js',
      '.prettierrc.config.cjs',
      '.prettierrc.json',
      '.prettierrc.json5',
      '.prettierrc.yaml',
      '.prettierrc.yml',
      '.prettierrc.toml',
    ] as const

    for (const file of files) {
      if (await hasFile(file)) return file
    }

    return null
  }

  public async hasPrettierConfig() {
    return (await this.findPrettierConfigLocation()) !== null
  }

  public async findOverlappingDependencies() {
    const includedDependencies =
      await this.eslintKitAPI.fetchIncludedDependencies()
    const oldEslintKitDependencies =
      await this.eslintKitAPI.fetchOldEslintKitDependencies()
    const installed = await this.manager.getDevelopment()

    return installed
      .map((dependency) => dependency.name)
      .filter(
        (name) =>
          includedDependencies.has(name) || oldEslintKitDependencies.has(name),
      )
  }

  public async hasPrettier() {
    return this.hasDevDependency('prettier')
  }

  public async hasAliases() {
    const packageJson = await this.readPackageJson()
    const jsconfig = await readJson('jsconfig.json')
    const tsconfig = await readJson('tsconfig.json')

    return Boolean(
      jsconfig?.compilerOptions?.baseUrl ||
        jsconfig?.compilerOptions?.paths ||
        tsconfig?.compilerOptions?.baseUrl ||
        tsconfig?.compilerOptions?.paths ||
        packageJson._moduleAliases,
    )
  }
}
