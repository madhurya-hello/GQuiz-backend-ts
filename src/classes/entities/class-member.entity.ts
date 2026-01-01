import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Class } from './class.entity';
import { User } from '../../users/entities/user.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MemberStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  PAST = 'past',
}

@Entity()
@Index(['class_id', 'user_id'], { unique: true }) 
export class ClassMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  // --- RELATIONSHIPS ---
  @ManyToOne(() => Class, (cls) => cls.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}