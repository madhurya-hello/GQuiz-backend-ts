import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  // Personal Info
  @Column({ type: 'date', nullable: true })
  dob: string; // YYYY-MM-DD

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false, name: 'phone_verified' })
  phoneVerified: boolean;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ name: 'roll_no', nullable: true })
  rollNo: string;

  // URLs
  @Column({ name: 'profile_photo_url', nullable: true })
  profilePhotoUrl: string;

  @Column({ name: 'profile_banner_url', nullable: true })
  profileBannerUrl: string;

  // JSON Columns for Scalability
  @Column({ type: 'json', nullable: true })
  social_links: Record<string, string>; // linkedin, twitter, etc.

  @Column({ type: 'json', nullable: true })
  academic_info: Record<string, any>; // university_name, semester, etc.

  @Column({ type: 'json', nullable: true, name: 'hidden_elements' })
  hiddenElements: string[];

  @Column({ type: 'timestamp', nullable: true, name: 'profile_last_updated' })
  profileLastUpdated: Date;

  // Relationships
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;
}