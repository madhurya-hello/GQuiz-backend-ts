import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { QuizSection } from './quiz-section.entity';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity()
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

  @Column({ type: 'json' })
  settings: Record<string, any>; 

  @Column({ type: 'json' })
  access_control: Record<string, any>;

  @OneToMany(() => QuizSection, (section) => section.quiz, { cascade: true })
  sections: QuizSection[];

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  creator: User;

  @Column({ nullable: true })
  class_id: number | null;

  @ManyToOne(() => Class, (cls) => cls.id, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class: Class;
}