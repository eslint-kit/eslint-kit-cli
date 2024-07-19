import fs from 'fs/promises'
import path from 'path'

export type PackageJson = {
  version: string
  type?: 'module' | 'commonjs'
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  eslintConfig?: Record<string, unknown>
  prettier?: Record<string, unknown>
  scripts?: Record<string, string>
  _moduleAliases?: Record<string, string>
}

export type Jsconfig = {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

export type Tsconfig = Jsconfig

export function resolveFromRoot(file: string) {
  return path.join(process.cwd(), file)
}

export async function readJson(
  file: 'package.json',
): Promise<PackageJson | null>

export async function readJson(file: 'jsconfig.json'): Promise<Jsconfig | null>
export async function readJson(file: 'tsconfig.json'): Promise<Tsconfig | null>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson(file: string): Promise<any | null> {
  try {
    const json = await fs.readFile(resolveFromRoot(file), 'utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function hasFile(file: string): Promise<boolean> {
  return fs
    .readFile(resolveFromRoot(file))
    .then(() => true)
    .catch(() => false)
}

export async function writeFile(
  file: string,
  content: string,
): Promise<boolean> {
  try {
    await fs.writeFile(path.resolve(process.cwd(), file), content)
    return true
  } catch {
    return false
  }
}

export async function removeFile(file: string): Promise<void> {
  await fs.rm(path.resolve(process.cwd(), file))
}
