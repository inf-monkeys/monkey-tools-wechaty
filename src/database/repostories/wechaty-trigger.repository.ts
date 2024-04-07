import { MessageType } from '@/common/typings/wechaty';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatyTriggerEntity } from '../entities/triggers.entity';

export interface CreateTriggerParams {
  enabled: boolean;
  triggerId: string;
  workflowId: string;
  worfklowVersion: number;
  extraData: {
    sessionId: string;
    msgType: MessageType;
    msgTalkerName: string[];
  };
  triggerEndpoint: string;
}

@Injectable()
export class TriggerRepository {
  constructor(
    @InjectRepository(WechatyTriggerEntity)
    public readonly wechatyTriggerRepo: Repository<WechatyTriggerEntity>,
  ) {}

  public async createTrigger(params: CreateTriggerParams) {
    const {
      enabled,
      worfklowVersion,
      workflowId,
      triggerId,
      extraData,
      triggerEndpoint,
    } = params;
    const entity = new WechatyTriggerEntity();
    entity.createdTimestamp = +new Date();
    entity.updatedTimestamp = +new Date();
    entity.isDeleted = false;
    entity.triggerId = triggerId;
    entity.enabled = enabled;
    entity.workflowId = workflowId;
    entity.worfklowVersion = worfklowVersion;
    entity.sessionId = extraData.sessionId;
    entity.triggerEndpoint = triggerEndpoint;
    entity.msgTalkerName = extraData.msgTalkerName;
    entity.msgType = extraData.msgType;
    await this.wechatyTriggerRepo.save(entity);
    return entity;
  }

  public async updateTrigger(
    triggerId: string,
    updates: {
      enabled: boolean;
    },
  ) {
    const trigger = await this.wechatyTriggerRepo.findOne({
      where: {
        triggerId,
        isDeleted: false,
      },
    });
    if (!trigger) {
      throw new Error('trigger 不存在');
    }
    await this.wechatyTriggerRepo.update(
      {
        triggerId,
      },
      updates,
    );
  }

  public async deleteTrigger(triggerId: string) {
    await this.wechatyTriggerRepo.update(
      {
        triggerId,
      },
      {
        isDeleted: true,
      },
    );
  }

  public async getTriggerBySessionId(sessionId: string) {
    return await this.wechatyTriggerRepo.findOne({
      where: {
        sessionId,
        enabled: true,
        isDeleted: false,
      },
    });
  }
}
