import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn('increment') 
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  banner_url: string;

  @Column()
  purpose: string;

  @Column()
  category: string; 

  @Column()
  subject: string;  

  @Column({ default: false })
  approval_required: boolean;

  @CreateDateColumn()
  date_created: Date;

  // --- ACCESS CONTROL ---
  @Column('simple-json', { nullable: true })
  allowed_email_domains: string[];

  @Column('simple-json', { nullable: true })
  allowed_emails: string[];

  @Column('simple-json', { nullable: true })
  restricted_email_domains: string[];

  @Column('simple-json', { nullable: true })
  restricted_emails: string[];

  // --- RELATIONSHIPS ---
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column() 
  owner_id: number;
}