import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { hasFile, readJson } from '@app/shared/lib/fs'
import { AbstractPackageManager } from '@app/shared/lib/package-managers'
import { InjectPackageManager } from '../package-manager'

@Injectable()
export class MetaService {
  constructor(
    @InjectPackageManager() private manager: AbstractPackageManager
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
    return this.hasDevDependency('typescript')
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

  public async hasEslintConfig() {
    return (await this.findEslintConfigLocation()) !== null
  }

  public async findPrettierConfigLocation() {
    const packageJson = await readJson('package.json')

    if (packageJson?.prettier) {
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
    const includedDependenciesUrl =
      'https://raw.githubusercontent.com/eslint-kit/eslint-kit/release/included-dependencies.json'
    const includedResponse = await axios(includedDependenciesUrl)
    const included = new Set<string>(includedResponse.data)
    const installed = await this.manager.getAll()
    return installed.filter(({ name }) => included.has(name))
  }

  public async hasPrettier() {
    return this.hasDevDependency('prettier')
  }

  public async hasAliases() {
    const packageJson = await readJson('package.json')
    const jsconfig = await readJson('jsconfig.json')
    const tsconfig = await readJson('tsconfig.json')

    return Boolean(
      jsconfig?.compilerOptions?.baseUrl ||
        jsconfig?.compilerOptions?.paths ||
        tsconfig?.compilerOptions?.baseUrl ||
        tsconfig?.compilerOptions?.paths ||
        packageJson?._moduleAliases
    )
  }
}
