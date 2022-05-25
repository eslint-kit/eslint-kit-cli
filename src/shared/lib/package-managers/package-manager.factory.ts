import fs from 'fs/promises'
import { AbstractPackageManager } from './abstract.package-manager'
import { NpmPackageManager } from './npm.package-manager'
import { PnpmPackageManager } from './pnpm.package-manager'
import { PackageManager } from './types'
import { YarnPackageManager } from './yarn.package-manager'

export class PackageManagerFactory {
  public static create(name: PackageManager): AbstractPackageManager {
    if (name === PackageManager.NPM) return new NpmPackageManager()
    if (name === PackageManager.YARN) return new YarnPackageManager()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (name === PackageManager.PNPM) return new PnpmPackageManager()
    throw new Error('Never')
  }

  public static async find(): Promise<AbstractPackageManager> {
    try {
      const files = await fs.readdir(process.cwd())

      if (files.includes('package-lock.json')) {
        return this.create(PackageManager.NPM)
      }

      if (files.includes('yarn.lock')) {
        return this.create(PackageManager.YARN)
      }

      if (files.includes('pnpm-lock.yaml')) {
        return this.create(PackageManager.PNPM)
      }

      throw new Error('No lockfile')
    } catch {
      return this.create(PackageManager.NPM)
    }
  }
}
