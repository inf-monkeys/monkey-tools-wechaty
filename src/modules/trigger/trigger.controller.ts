import { CreateTriggerParams } from '@/database/repostories/wechaty-trigger.repository';
import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { TriggerService } from './trigger.service';

@Controller('triggers')
export class TriggerController {
  constructor(private readonly service: TriggerService) {}

  @Post('/')
  public async registerTrigger(@Body() body: CreateTriggerParams) {
    return await this.service.createTrigger(body);
  }

  @Put('/:triggerId')
  public async updateTrigger(
    @Param('triggerId') triggerId: string,
    @Body()
    body: {
      enabled: boolean;
    },
  ) {
    return await this.service.updateTrigger(triggerId, body);
  }

  @Delete('/:triggerId')
  public async deleteTrigger(@Param('triggerId') triggerId: string) {
    return await this.service.deleteTrigger(triggerId);
  }
}
