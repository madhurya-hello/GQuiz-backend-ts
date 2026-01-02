import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'account_created' })
  accountCreated: Date;

  @Column({ nullable: true, name: 'device_key' })
  deviceKey: string;

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string;

  // --- RELATIONS ---
  
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @ManyToMany(() => Quiz)
  @JoinTable({
    name: 'user_starred_quizzes',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'quiz_id', referencedColumnName: 'id' },
  })
  starredQuizzes: Quiz[];
}