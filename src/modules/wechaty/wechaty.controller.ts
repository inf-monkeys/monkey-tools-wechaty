import { IRequest } from '@/common/typings/request';
import { WechatySessionStatus } from '@/database/entities/wechaty-session.entity';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { WechatyService } from './wechaty.service';

interface QRCodeUserInfo {
  displayName: string;
  id: string;
  avatar: string;
}

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
    userinfo?: QRCodeUserInfo;
  };
}

interface CheckQRCodeResult {
  data: {
    status: WechatySessionStatus;
    userinfo?: QRCodeUserInfo;
  };
}

interface InitSessionBody {
  puppet: string;
  workflowId: string;
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
    const { puppet } = body;
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
            width: 260,
            height: 260,
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
  public async checkSession(
    @Param('sessionId') sessionId: string,
  ): Promise<CheckQRCodeResult> {
    const session = await this.service.getSession(sessionId);
    if (session.status === WechatySessionStatus.LOGGED_IN) {
      let memoryCard = JSON.parse(session.memoryCard);
      memoryCard = memoryCard[Object.keys(memoryCard)[0]];
      return {
        data: {
          status: WechatySessionStatus.LOGGED_IN,
          userinfo: {
            displayName: memoryCard.user.NickName,
            id: memoryCard.user.UserName,
            avatar: memoryCard.user.HeadImgUrl,
          },
        },
      };
    } else {
      return {
        data: {
          status: session.status,
        },
      };
    }
  }
}
