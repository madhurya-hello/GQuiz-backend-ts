import { Entity, Index, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { QuizSection } from './quiz-section.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@Index(['validity_quiz_start', 'validity_quiz_end'])
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  validity_quiz_start: Date;

  @Column({ type: 'timestamp' })
  validity_quiz_end: Date;

  @Column()
  quiz_duration: number; 

  @Column({ default: 0 })
  total_marks: number;

  @Column({ type: 'timestamp', nullable: true })
  result_declared: Date;

  @Column({ type: 'json' })
  settings: Record<string, any>; 

  @Column('simple-json', { nullable: true })
  allowed_emails: string[];

  @Column('simple-json', { nullable: true })
  blocked_emails: string[];

  @Column('simple-json', { nullable: true })
  allowed_email_domains: string[];

  @Column('simple-json', { nullable: true })
  blocked_email_domains: string[];

  @OneToMany(() => QuizSection, (section) => section.quiz, { cascade: true })
  sections: QuizSection[];

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  creator: User; 
}