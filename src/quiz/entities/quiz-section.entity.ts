import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Question } from './question.entity';

@Entity()
export class QuizSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  section_no: number;

  @Column()
  section_name: string;

  @Column()
  total_section_marks: number;

  // Stores: time_limit, questions_limit, shuffle_questions, etc.
  @Column({ type: 'json' })
  section_settings: Record<string, any>;

  @ManyToOne(() => Quiz, (quiz) => quiz.sections, { onDelete: 'CASCADE' })
  quiz: Quiz;

  @OneToMany(() => Question, (question) => question.section, { cascade: true })
  questions: Question[];
}