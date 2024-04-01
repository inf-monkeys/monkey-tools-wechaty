import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './database.module';
import { WechatyRepository } from './repostories/wechaty.repository';

@Global()
@Module({
  providers: [WechatyRepository],
  exports: [WechatyRepository],
  imports: [TypeOrmModule.forFeature(entities)],
})
export class RepositoryMoule {}
