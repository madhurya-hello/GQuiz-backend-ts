import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export enum ActivityEntityType {
  CLASS = 'class',
  QUIZ = 'quiz',
}

@Entity()
@Unique(['user_id', 'entity_type', 'entity_id'])
@Index(['user_id', 'entity_type', 'last_interacted_at'])
export class UserRecentActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'enum', enum: ActivityEntityType })
  entity_type: ActivityEntityType;

  @Column()
  entity_id: number;

  @UpdateDateColumn()
  last_interacted_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}