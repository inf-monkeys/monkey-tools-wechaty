import { Module } from '@nestjs/common';
import { WechatyController } from './wechaty.controller';
import { WechatyService } from './wechaty.service';

@Module({
  providers: [WechatyService],
  controllers: [WechatyController],
})
export class WechatyModule {}
