import execa from 'execa'
import ora from 'ora'
import { readJson } from '../fs'
import { stringifyDependencies } from './stringify-dependencies'
import { PackageManagerCommands, ProjectDependency } from './types'

export abstract class AbstractPackageManager {
  constructor(private commandBase: string) {}

  public abstract get cli(): PackageManagerCommands

  public get name() {
    return this.commandBase.toUpperCase()
  }

  public async run(args: string[]) {
    const output = await execa(this.commandBase, args)
    return output.stdout
  }

  public async version(): Promise<string> {
    return this.run(['--version'])
  }

  public async addProduction(
    dependencies: ProjectDependency[],
  ): Promise<boolean> {
    const commandArguments = stringifyDependencies(dependencies)
    return this.add([this.cli.add, this.cli.saveFlag, ...commandArguments])
  }

  public async addDevelopment(dependencies: ProjectDependency[]) {
    const commandArguments = stringifyDependencies(dependencies)
    await this.add([this.cli.add, this.cli.saveDevFlag, ...commandArguments])
  }

  private async add(commandArguments: string[]) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Installing dependencies..',
    })

    spinner.start()

    try {
      await this.run(commandArguments)
      spinner.succeed('Successfully added dependencies')
      return true
    } catch {
      spinner.fail('Dependencies adding failed')
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

  public async getPeer(): Promise<ProjectDependency[]> {
    const packageJson = await readJson('package.json')
    if (!packageJson) return []

    const { peerDependencies = [] } = packageJson
    return Object.entries(peerDependencies).map(([name, version]) => ({
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
    await this.update([this.cli.update, ...dependencies])
  }

  public async updateDevelopment(dependencies: string[]) {
    await this.update([this.cli.update, ...dependencies])
  }

  private async update(commandArguments: string[]) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Updating dependencies..',
    })

    spinner.start()

    try {
      await this.run(commandArguments)
      spinner.succeed('Successfully updated dependencies')
      return true
    } catch {
      spinner.fail('Dependencies updating failed')
      return false
    }
  }

  public async upgradeProduction(dependencies: ProjectDependency[]) {
    await this.delete(dependencies.map((dep) => dep.name))
    await this.addProduction(dependencies)
  }

  public async upgradeDevelopment(dependencies: ProjectDependency[]) {
    await this.delete(dependencies.map((dep) => dep.name))
    await this.addDevelopment(dependencies)
  }

  public async delete(dependencies: string[]) {
    const spinner = ora({
      spinner: 'dots',
      text: 'Deleting dependencies..',
    })

    spinner.start()

    try {
      await this.run([this.cli.remove, ...dependencies])
      spinner.succeed('Successfully deleted dependencies')
      return true
    } catch {
      spinner.fail('Dependencies deleting failed')
      return false
    }
  }
}
