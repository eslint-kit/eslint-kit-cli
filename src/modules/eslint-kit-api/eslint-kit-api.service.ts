import { Injectable } from '@nestjs/common'
import axios from 'axios'

const repo = axios.create({
  baseURL: 'https://raw.githubusercontent.com/eslint-kit/eslint-kit/release',
})

@Injectable()
export class EslintKitApiService {
  public async fetchIncludedDependencies() {
    const response = await repo.get('/included-dependencies.json')
    return new Set<string>(response.data)
  }

  public async fetchOldEslintKitDependencies() {
    return new Set<string>(
      [
        'base',
        'node',
        'patch',
        'prettier',
        'react',
        'react-new-jsx-transform',
        'typescript',
      ].map((name) => `@eslint-kit/eslint-config-${name}`)
    )
  }

  public async fetchPrettierRecommended() {
    const response = await repo.get('/prettier-recommended.json')
    return response.data
  }
}
