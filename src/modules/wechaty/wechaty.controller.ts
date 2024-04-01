import { IRequest } from '@/common/typings/request';
import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { WechatyService } from './wechaty.service';

@Controller('wechaty')
export class WechatyController {
  constructor(private readonly service: WechatyService) {}

  @Post('sessions')
  public async initSession(@Req() req: IRequest) {
    const { teamId, userId } = req;
    const sessionId = await this.service.initSession(teamId, userId);
    const qrcodeUrl = await this.service.waitForQrcodeGenerated(sessionId);
    return {
      sessionId,
      qrcodeUrl: qrcodeUrl,
    };
  }

  @Get('/sessions/:sessionId')
  public async checkSession(@Param('sessionId') sessionId: string) {
    const data = await this.service.getSession(sessionId);
    return data;
  }
}
