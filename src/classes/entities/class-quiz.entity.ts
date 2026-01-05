import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Class } from './class.entity';

@Entity()
@Index(['class_id', 'quiz_id']) // speeds up fetching all quizzes for a list of classes
export class ClassQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_id: number;

  @Column()
  quiz_id: number;

  @ManyToOne(() => Class, (cls) => cls.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;
}