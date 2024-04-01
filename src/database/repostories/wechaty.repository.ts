import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import {
  WechatSessionEntity,
  WechatySessionStatus,
} from '../entities/wechaty-session.entity';

export interface InitSessionParams {
  teamId: string;
  userId: string;
  puppet: string;
}

export interface UpdateWechatySessionParams {
  sessionId: string;
  memoryCard?: string;
  status: WechatySessionStatus;
  qrcodeUrl?: string;
}

@Injectable()
export class WechatyRepository {
  constructor(
    @InjectRepository(WechatSessionEntity)
    public readonly wechatSessionRepo: Repository<WechatSessionEntity>,
  ) {}

  public async initSession(params: InitSessionParams) {
    const { teamId, userId, puppet } = params;
    const entity = new WechatSessionEntity();
    entity.createdTimestamp = +new Date();
    entity.updatedTimestamp = +new Date();
    entity.isDeleted = false;
    entity.teamId = teamId;
    entity.userId = userId;
    entity.sessionId = uuid.v4();
    entity.puppet = puppet;
    entity.status = WechatySessionStatus.WAIT_FOR_QRCODE_GENERATE;
    await this.wechatSessionRepo.save(entity);
    return entity.sessionId;
  }

  public async getSession(sessionId: string) {
    return await this.wechatSessionRepo.findOne({
      where: {
        sessionId,
      },
    });
  }

  public async updateSession(params: UpdateWechatySessionParams) {
    const { sessionId, memoryCard, status, qrcodeUrl } = params;
    const session = await this.wechatSessionRepo.findOne({
      where: {
        sessionId,
      },
    });
    if (memoryCard) {
      session.memoryCard = memoryCard;
    }
    if (status) {
      session.status = status;
    }
    if (qrcodeUrl) {
      session.qrcodeUrl = qrcodeUrl;
    }
    await this.wechatSessionRepo.save(session);
  }

  public async findOneValidSession(startupTimestamp: number) {
    const session = await this.wechatSessionRepo
      .createQueryBuilder('session')
      .where('session.status = :status', {
        status: WechatySessionStatus.LOGGED_IN,
      })
      .andWhere(
        '(session.lastFetchedAt IS NULL OR session.lastFetchedAt < :startupTimestamp)',
        { startupTimestamp },
      )
      .getOne();

    if (session) {
      session.lastFetchedAt = +new Date();
      await this.wechatSessionRepo.save(session);
    }
    return session;
  }
}
