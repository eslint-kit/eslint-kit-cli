import { Global, Module } from '@nestjs/common'
import { EslintKitApiService } from './eslint-kit-api.service'

@Global()
@Module({
  providers: [EslintKitApiService],
  exports: [EslintKitApiService],
})
export class EslintKitApiModule {}
