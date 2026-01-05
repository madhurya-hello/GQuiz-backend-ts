import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['receiver_user_id', 'created_at']) // Optimizes the list fetch
export class Notification {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  receiver_user_id: number;

  @Column({ nullable: true })
  sender_user_id: number;

  @Column('text')
  text: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Denormalized Sender Info
  @Column({ type: 'varchar', nullable: true })
  sender_snapshot_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  sender_snapshot_photo: string | null;
}