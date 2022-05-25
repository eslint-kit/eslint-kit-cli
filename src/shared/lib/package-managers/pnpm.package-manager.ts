import { AbstractPackageManager } from './abstract.package-manager'
import { PackageManager, PackageManagerCommands } from './types'

export class PnpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.PNPM)
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'install',
      update: 'update',
      remove: 'uninstall',
      saveFlag: '--save',
      saveDevFlag: '--save-dev',
      silentFlag: '--reporter=silent',
    }
  }
}
