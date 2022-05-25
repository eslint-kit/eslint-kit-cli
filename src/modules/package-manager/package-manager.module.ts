import { Global, Module } from '@nestjs/common'
import { PackageManagerFactory } from '@app/shared/lib/package-managers'

@Global()
@Module({
  providers: [
    {
      provide: 'PACKAGE_MANAGER',
      useFactory: () => PackageManagerFactory.find(),
    },
  ],
  exports: ['PACKAGE_MANAGER'],
})
export class PackageManagerModule {}
