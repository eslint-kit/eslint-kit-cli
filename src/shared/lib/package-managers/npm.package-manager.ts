import { AbstractPackageManager } from './abstract.package-manager'
import { PackageManager, PackageManagerCommands } from './types'

export class NpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.NPM)
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'install',
      update: 'update',
      remove: 'uninstall',
      saveFlag: '--save',
      saveDevFlag: '--save-dev',
      silentFlag: '--silent',
    }
  }
}
