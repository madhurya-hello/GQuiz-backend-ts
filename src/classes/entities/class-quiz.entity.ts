import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from './class.entity';

@Entity()
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