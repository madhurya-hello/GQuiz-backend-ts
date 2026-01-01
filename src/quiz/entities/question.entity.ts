import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { QuizSection } from './quiz-section.entity';
import { QuestionOption } from './question-option.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  question_text: string;

  @Column('simple-json', { nullable: true })
  image_urls: string[];

  @Column()
  answer_type: string; // 'mcq', 'code', 'text'

  @Column()
  positive_mark: number;

  @Column()
  negative_mark: number;

  @Column()
  is_compulsory: boolean;

  // 🟢 SCALABILITY WIN: Stores code_config, test_cases, ai_eval rules here
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => QuizSection, (section) => section.questions, { onDelete: 'CASCADE' })
  section: QuizSection;

  @OneToMany(() => QuestionOption, (option) => option.question, { cascade: true })
  options: QuestionOption[];
}