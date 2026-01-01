import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuizSection } from './quiz-section.entity';

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
  quiz_duration: number; // in seconds

  // 🟢 SCALABILITY WIN: Storing constraints and violation rules as JSON
  @Column({ type: 'json' })
  settings: Record<string, any>; 

  // 🟢 SCALABILITY WIN: Storing complex access rules (domains, emails) as JSON
  @Column({ type: 'json' })
  access_control: Record<string, any>;

  @OneToMany(() => QuizSection, (section) => section.quiz, { cascade: true })
  sections: QuizSection[];
}