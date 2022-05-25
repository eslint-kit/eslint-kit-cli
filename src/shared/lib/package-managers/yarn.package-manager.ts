import { AbstractPackageManager } from './abstract.package-manager'
import { PackageManager, PackageManagerCommands } from './types'

export class YarnPackageManager extends AbstractPackageManager {
  constructor() {
    super(PackageManager.YARN)
  }

  get cli(): PackageManagerCommands {
    return {
      install: 'install',
      add: 'add',
      update: 'upgrade',
      remove: 'remove',
      saveFlag: '',
      saveDevFlag: '-D',
      silentFlag: '--silent',
    }
  }
}
