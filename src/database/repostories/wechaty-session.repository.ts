import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as uuid from 'uuid';
import {
  WechatySessionEntity,
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
    @InjectRepository(WechatySessionEntity)
    public readonly wechatySessionRepo: Repository<WechatySessionEntity>,
  ) {}

  public async createSession(params: InitSessionParams) {
    const { teamId, userId, puppet } = params;
    const entity = new WechatySessionEntity();
    entity.createdTimestamp = +new Date();
    entity.updatedTimestamp = +new Date();
    entity.isDeleted = false;
    entity.teamId = teamId;
    entity.userId = userId;
    entity.sessionId = uuid.v4();
    entity.puppet = puppet;
    entity.status = WechatySessionStatus.WAIT_FOR_QRCODE_GENERATE;
    await this.wechatySessionRepo.save(entity);
    return entity;
  }

  public async createSessionIfNoeExists(
    params: InitSessionParams,
  ): Promise<[boolean, WechatySessionEntity]> {
    const { teamId, userId, puppet } = params;
    const session = await this.wechatySessionRepo.findOne({
      where: {
        teamId,
        userId,
        puppet,
        status: WechatySessionStatus.LOGGED_IN,
      },
    });
    if (session) {
      return [false, session];
    } else {
      return [true, await this.createSession(params)];
    }
  }

  public async getSession(sessionId: string) {
    return await this.wechatySessionRepo.findOne({
      where: {
        sessionId,
      },
    });
  }

  public async updateSession(params: UpdateWechatySessionParams) {
    const { sessionId, memoryCard, status, qrcodeUrl } = params;
    const session = await this.wechatySessionRepo.findOne({
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
    await this.wechatySessionRepo.save(session);
  }

  public async findOneValidSession(startupTimestamp: number) {
    const session = await this.wechatySessionRepo
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
      await this.wechatySessionRepo.save(session);
    }
    return session;
  }
}
