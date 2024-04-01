import { Column, Entity, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from './base';

export enum WechatySessionStatus {
  WAIT_FOR_QRCODE_GENERATE = 'WAIT_FOR_QRCODE_GENERATE',
  PENDING_SCAN = 'PENDING_SCAN',
  LOGGED_IN = 'LOGGED_IN',
  LOGOUT = 'LOGOUT',
}

@Entity({ name: 'wechaty_session' })
@Index(['sessionId'], { unique: true })
export class WechatSessionEntity extends BaseEntity {
  @VersionColumn()
  version: number;

  @Column({
    type: 'varchar',
    name: 'team_id',
  })
  teamId: string;

  @Column({
    type: 'varchar',
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'varchar',
    name: 'session_id',
  })
  sessionId: string;

  @Column({
    type: 'varchar',
  })
  puppet: string;

  @Column({
    nullable: true,
    name: 'qrcode_url',
  })
  qrcodeUrl?: string;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  status: WechatySessionStatus;

  @Column({
    nullable: true,
    type: 'bigint',
    name: 'last_fetched_at',
  })
  lastFetchedAt?: number;

  @Column({
    name: 'memory_card',
    nullable: true,
    type: 'text',
  })
  memoryCard: string;
}
