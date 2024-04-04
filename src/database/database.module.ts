import { config } from '@/common/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { WechatySessionEntity } from './entities/wechaty-session.entity';

export const entities: EntityClassOrSchema[] = [WechatySessionEntity];

export const DatabaseModule = TypeOrmModule.forRoot({
  ...config.database,
  entities: entities,
});
