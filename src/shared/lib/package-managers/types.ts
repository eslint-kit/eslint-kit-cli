export enum PackageManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
}

export type ProjectDependency = {
  name: string
  version?: string
}

export type PackageManagerCommands = {
  install: string
  add: string
  update: string
  remove: string
  saveFlag: string
  saveDevFlag: string
  silentFlag: string
}
