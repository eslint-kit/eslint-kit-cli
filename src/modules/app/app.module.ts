import { Module } from '@nestjs/common'
import { InitCommand } from '../commands/init.command'
import { EslintKitApiModule } from '../eslint-kit-api/eslint-kit-api.module'
import { MetaModule } from '../meta'
import { PackageManagerModule } from '../package-manager'

@Module({
  imports: [PackageManagerModule, MetaModule, EslintKitApiModule],
  providers: [InitCommand],
})
export class AppModule {}
