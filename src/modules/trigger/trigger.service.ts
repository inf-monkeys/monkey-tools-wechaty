import {
  CreateTriggerParams,
  TriggerRepository,
} from '@/database/repostories/wechaty-trigger.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TriggerService {
  constructor(private readonly triggerRepository: TriggerRepository) {}

  public async createTrigger(params: CreateTriggerParams) {
    return await this.triggerRepository.createTrigger(params);
  }

  public async updateTrigger(
    triggerId: string,
    updates: {
      enabled: boolean;
    },
  ) {
    return await this.triggerRepository.updateTrigger(triggerId, updates);
  }

  public async deleteTrigger(triggerId: string) {
    return await this.triggerRepository.deleteTrigger(triggerId);
  }
}
