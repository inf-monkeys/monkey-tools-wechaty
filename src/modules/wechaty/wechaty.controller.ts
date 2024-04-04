import { IRequest } from '@/common/typings/request';
import { WechatySessionStatus } from '@/database/entities/wechaty-session.entity';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { WechatyService } from './wechaty.service';

interface GeneQRCodeResult {
  data: {
    sessionId: string;
    status: WechatySessionStatus;
    qrcode?: {
      type: 'image' | 'iframe';
      src: string;
      width: number;
      height: number;
    };
    userinfo?: {
      displayName: string;
      id: string;
      avatar: string;
    };
  };
}

interface InitSessionBody {
  context: {
    puppet: string;
    workflowId: string;
  };
}

@Controller('wechaty')
export class WechatyController {
  constructor(private readonly service: WechatyService) {}

  @Post('sessions')
  public async initSession(
    @Req() req: IRequest,
    @Body() body: InitSessionBody,
  ): Promise<GeneQRCodeResult> {
    const { teamId, userId } = req;
    const {
      context: { puppet },
    } = body;
    const [created, session] = await this.service.initSession(
      teamId,
      userId,
      puppet,
    );
    if (created) {
      const qrcodeUrl = await this.service.waitForQrcodeGenerated(
        session.sessionId,
      );
      return {
        data: {
          sessionId: session.sessionId,
          status: WechatySessionStatus.PENDING_SCAN,
          qrcode: {
            type: 'iframe',
            src: qrcodeUrl,
            width: 300,
            height: 300,
          },
        },
      };
    } else {
      let memoryCard = JSON.parse(session.memoryCard);
      memoryCard = memoryCard[Object.keys(memoryCard)[0]];
      return {
        data: {
          sessionId: session.sessionId,
          status: WechatySessionStatus.LOGGED_IN,
          userinfo: {
            displayName: memoryCard.user.NickName,
            id: memoryCard.user.UserName,
            avatar: memoryCard.user.HeadImgUrl,
          },
        },
      };
    }
  }

  @Get('/sessions/:sessionId')
  public async checkSession(@Param('sessionId') sessionId: string) {
    const data = await this.service.getSession(sessionId);
    return data;
  }
}
