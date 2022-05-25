import '@cspotcode/zx'
import ora from 'ora'
import { joinArguments } from '../commands'
import { readJson } from '../fs'
import { PackageManagerCommands, ProjectDependency } from './types'

export abstract class AbstractPackageManager {
  constructor(private commandBase: string) {}

  public abstract get cli(): PackageManagerCommands

  public get name() {
    return this.commandBase.toUpperCase()
  }

  public async run(args: string) {
    const output = await $`${this.commandBase} ${args}`
    return output.stdout
  }

  public async version(): Promise<string> {
    const commandArguments = '--version'
    return this.run(commandArguments)
  }

  public async addProduction(
    dependencies: ProjectDependency[]
  ): Promise<boolean> {
    const command = joinArguments([this.cli.add, this.cli.saveFlag])

    const commandArguments = dependencies
      .map(({ name, version }) => `${name}@${version}`)
      .join(' ')

    return this.add(`${command} ${commandArguments}`)
  }

  public async addDevelopment(dependencies: ProjectDependency[]) {
    const command = joinArguments([this.cli.add, this.cli.saveDevFlag])

    const commandArguments = dependencies
      .map(({ name, version }) => `${name}@${version}`)
      .join(' ')

    await this.add(`${command} ${commandArguments}`)
  }

  private async add(commandArguments: string) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Installing dependencies..',
    })

    spinner.start()

    try {
      await this.run(commandArguments)
      spinner.succeed()
      return true
    } catch {
      spinner.fail()
      return false
    }
  }

  public async getProduction(): Promise<ProjectDependency[]> {
    const packageJson = await readJson('package.json')
    if (!packageJson) return []

    const { dependencies = [] } = packageJson
    return Object.entries(dependencies).map(([name, version]) => ({
      name,
      version,
    }))
  }

  public async getDevelopment(): Promise<ProjectDependency[]> {
    const packageJson = await readJson('package.json')
    if (!packageJson) return []

    const { devDependencies = [] } = packageJson
    return Object.entries(devDependencies).map(([name, version]) => ({
      name,
      version,
    }))
  }

  public async getAll(): Promise<ProjectDependency[]> {
    const production = await this.getProduction()
    const development = await this.getDevelopment()
    return [...production, ...development]
  }

  public async updateProduction(dependencies: string[]) {
    const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`
    await this.update(commandArguments)
  }

  public async updateDevelopment(dependencies: string[]) {
    const commandArguments = `${this.cli.update} ${dependencies.join(' ')}`
    await this.update(commandArguments)
  }

  private async update(commandArguments: string) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Updating dependencies..',
    })

    spinner.start()

    try {
      await this.run(commandArguments)
      spinner.succeed()
      return true
    } catch {
      spinner.fail()
      return false
    }
  }

  public async upgradeProduction(dependencies: ProjectDependency[]) {
    await this.deleteProduction(dependencies.map((dep) => dep.name))
    await this.addProduction(dependencies)
  }

  public async upgradeDevelopment(dependencies: ProjectDependency[]) {
    await this.deleteProduction(dependencies.map((dep) => dep.name))
    await this.addDevelopment(dependencies)
  }

  public async deleteProduction(dependencies: string[]) {
    const command: string = joinArguments([this.cli.remove, this.cli.saveFlag])
    const commandArguments: string = dependencies.join(' ')
    await this.delete(`${command} ${commandArguments}`)
  }

  public async deleteDevelopment(dependencies: string[]) {
    const command = joinArguments([this.cli.remove, this.cli.saveDevFlag])
    const commandArguments: string = dependencies.join(' ')
    await this.delete(`${command} ${commandArguments}`)
  }

  public async delete(commandArguments: string) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Deleting dependencies..',
    })

    spinner.start()

    try {
      await this.run(commandArguments)
      spinner.succeed()
      return true
    } catch {
      spinner.fail()
      return false
    }
  }
}
