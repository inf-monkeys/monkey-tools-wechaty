import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './database.module';
import { WechatyRepository } from './repostories/wechaty-session.repository';
import { TriggerRepository } from './repostories/wechaty-trigger.repository';

@Global()
@Module({
  providers: [WechatyRepository, TriggerRepository],
  exports: [WechatyRepository, TriggerRepository],
  imports: [TypeOrmModule.forFeature(entities)],
})
export class RepositoryMoule {}
