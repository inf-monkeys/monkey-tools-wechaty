import { IRequest } from '@/common/typings/request';
import { Body, Controller, Post, Req } from '@nestjs/common';

interface RegisterTriggerBody {
  sessionId: string;
  workflowId: string;
  triggerId: string;
}

@Controller('triggers')
export class TriggerController {
  @Post('/')
  public async registerTrigger(
    @Req() req: IRequest,
    @Body() body: RegisterTriggerBody,
  ) {}
}
