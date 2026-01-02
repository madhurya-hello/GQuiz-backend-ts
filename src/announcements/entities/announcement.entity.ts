import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';

export enum AnnouncementType {
  ASSIGNMENT = 'assignment',
  RESOURCES = 'resources',
  QUIZ = 'quiz',
  TEXT = 'text',
}

export enum AnnouncementState {
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  DRAFT = 'draft',
}

@Entity()
@Index(['class_id', 'state', 'created_at']) 
@Index(['state', 'scheduled_at']) 
export class Announcement {
  @PrimaryGeneratedColumn({ type: 'bigint' }) 
  id: number;

  @Column({ type: 'enum', enum: AnnouncementType })
  type: AnnouncementType;

  @Column({ type: 'enum', enum: AnnouncementState, default: AnnouncementState.DRAFT })
  state: AnnouncementState;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'json', nullable: true })
  materials: Record<string, any>[];

  @Column({ type: 'int', nullable: true }) 
  total_marks: number | null; 

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  due_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  class_id: number;

  @ManyToOne(() => Class, (cls) => cls.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  creator: User;

  @Column({ type: 'int', nullable: true })
  quiz_id: number | null;

  @ManyToOne(() => Quiz, (quiz) => quiz.id, { nullable: true })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}