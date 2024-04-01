import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'created_timestamp',
    default: Date.now(),
    type: 'bigint',
  })
  createdTimestamp: number;

  @Column({
    name: 'updated_timestamp',
    default: Date.now(),
    type: 'bigint',
  })
  updatedTimestamp: number;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted?: boolean;
}
