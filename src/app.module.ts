import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './common/cache/cache.module';
import { LockModule } from './common/lock/lock.module';
import { CommonMiddleware } from './common/middlewares/common.middleware';
import { DatabaseModule } from './database/database.module';
import { RepositoryMoule } from './database/repositories.module';
import { WechatyModule } from './modules/wechaty/wechaty.module';
import { TriggerModule } from './modules/trigger/trigger.module';

@Module({
  imports: [
    CacheModule,
    LockModule,
    WechatyModule,
    DatabaseModule,
    RepositoryMoule,
    TriggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CommonMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
