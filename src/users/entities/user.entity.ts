import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // --- NEW FIELDS ---
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true }) // Storing the device key
  deviceKey: string;

  @Column({ nullable: true })
  refreshToken: string;
}