#!/usr/bin/env node
import { CommandFactory } from 'nest-commander'
import { AppModule } from '@app/modules/app'

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error'])
}

bootstrap()
