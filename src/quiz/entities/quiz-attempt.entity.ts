import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Quiz } from './quiz.entity';

export enum AttemptStatus {
  STARTED = 'started',
  SUBMITTED = 'submitted',
}

@Entity()
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  quiz_id: number;

  @Column({ type: 'enum', enum: AttemptStatus, default: AttemptStatus.STARTED })
  status: AttemptStatus;

  @Column({ type: 'float', nullable: true })
  score: number;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.id)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}