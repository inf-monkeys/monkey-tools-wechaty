import { MessageType } from '@/common/typings/wechaty';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base';

@Entity({ name: 'wechaty_triggers' })
export class WechatyTriggerEntity extends BaseEntity {
  @Column({
    name: 'trigger_id',
    type: 'varchar',
  })
  triggerId: string;

  @Column({
    name: 'trigger_endpoint',
    type: 'varchar',
  })
  triggerEndpoint: string;

  @Column({
    name: 'session_id',
    type: 'varchar',
  })
  sessionId: string;

  @Column({
    name: 'workflow_id',
    type: 'varchar',
  })
  workflowId: string;

  @Column({
    name: 'workflow_version',
    type: 'integer',
  })
  worfklowVersion: number;

  @Column({
    name: 'enabled',
    default: false,
  })
  enabled: boolean;

  @Column({
    name: 'msg_type',
    type: 'integer',
  })
  msgType: MessageType;

  @Column({
    name: 'msg_talker_name',
    type: 'simple-json',
  })
  msgTalkerName: string[];
}
