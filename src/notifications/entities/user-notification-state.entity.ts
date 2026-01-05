import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
export class UserNotificationState {
  @PrimaryColumn()
  user_id: number;

  @Column({ default: false })
  has_unread: boolean;

  @UpdateDateColumn()
  last_updated: Date;
}