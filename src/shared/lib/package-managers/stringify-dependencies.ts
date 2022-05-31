import { ProjectDependency } from './types'

export function stringifyDependencies(
  dependencies: ProjectDependency[]
): string[] {
  return dependencies.map(({ name, version }) => {
    if (!version) return name
    return `${name}@${version}`
  })
}
