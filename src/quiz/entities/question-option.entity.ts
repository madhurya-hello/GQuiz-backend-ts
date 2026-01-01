import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  option_no: number;

  @Column('text')
  text: string;

  @Column('simple-json', { nullable: true })
  image_urls: string[];

  @Column({ default: false })
  is_correct: boolean;

  @ManyToOne(() => Question, (question) => question.options, { onDelete: 'CASCADE' })
  question: Question;
}