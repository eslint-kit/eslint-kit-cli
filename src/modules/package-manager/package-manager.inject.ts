import { Inject } from '@nestjs/common'

export const InjectPackageManager = () => Inject('PACKAGE_MANAGER')
