import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserNotificationState } from './entities/user-notification-state.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(UserNotificationState) private stateRepo: Repository<UserNotificationState>,
    private dataSource: DataSource,
  ) {}

  // FAST DASHBOARD CHECK
  async hasUnread(userId: number): Promise<boolean> {
    const state = await this.stateRepo.findOne({ where: { user_id: userId } });
    return state ? state.has_unread : false;
  }

  // FETCH & MARK READ 
  async fetchAndMarkRead(userId: number) {
    const logs = await this.notifRepo.find({
      where: { receiver_user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });

    await this.stateRepo.save({ user_id: userId, has_unread: false });
    
    // Mark specific logs as read
    if (logs.length > 0) {
      await this.notifRepo.update({ receiver_user_id: userId, is_read: false }, { is_read: true });
    }

    return logs;
  }

  // SEND NOTIFICATION
  async send(
    receiverId: number, 
    senderId: number, 
    text: string, 
    senderName: string | null,  
    senderPhoto: string | null  
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const notif = this.notifRepo.create({
        receiver_user_id: receiverId,
        sender_user_id: senderId,
        text,
        sender_snapshot_name: senderName || 'Unknown',
        sender_snapshot_photo: senderPhoto,
      });
      await queryRunner.manager.save(notif);

      await queryRunner.manager.save(UserNotificationState, {
        user_id: receiverId,
        has_unread: true
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}