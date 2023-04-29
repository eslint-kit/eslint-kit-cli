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
    private eslintKitAPI: EslintKitApiService
  ) {}

  private async hasProdDependency(name: string) {
    const dependencies = await this.manager.getProduction()
    return dependencies.find((item) => item.name === name) !== undefined
  }

  private async hasDevDependency(name: string) {
    const dependencies = await this.manager.getDevelopment()
    return dependencies.find((item) => item.name === name) !== undefined
  }

  private async hasDependency(name: string) {
    const hasProd = await this.hasProdDependency(name)
    const hasDev = await this.hasDevDependency(name)
    return hasProd || hasDev
  }

  public async hasReact() {
    return this.hasProdDependency('react')
  }

  public async hasNextJs() {
    return this.hasProdDependency('next')
  }

  public async hasRemix() {
    return this.hasProdDependency('@remix-run/react')
  }

  public async hasVue() {
    return this.hasProdDependency('vue')
  }

  public async hasSolidJs() {
    return this.hasProdDependency('solid-js')
  }

  public async hasSvelte() {
    return this.hasProdDependency('svelte')
  }

  public async hasEffector() {
    return this.hasProdDependency('effector')
  }

  public async isNextJs() {
    return this.hasDependency('next')
  }

  public async isCRA() {
    return this.hasDependency('react-scripts')
  }

  public async hasEslintKit() {
    return this.hasDevDependency('eslint-kit')
  }

  public async hasTypeScript() {
    return this.hasDependency('typescript')
  }

  public async hasEslint() {
    return this.hasDevDependency('eslint')
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
            ` Please check your terminal session location`
        )
      )
      process.exit(1)
    }

    return packageJson
  }

  public async updatePackageJsonField<T extends keyof PackageJson>(
    field: T,
    value: PackageJson[T]
  ) {
    const json = await this.readPackageJson()
    delete json[field]
    json[field] = value
    await writeFile('package.json', JSON.stringify(json, null, 2))
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
          includedDependencies.has(name) || oldEslintKitDependencies.has(name)
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
        packageJson._moduleAliases
    )
  }
}
