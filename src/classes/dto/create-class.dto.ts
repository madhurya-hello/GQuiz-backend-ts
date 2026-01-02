import { IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateClassDto {

  @IsDateString()
  date_created: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  active_members: number[];

  @IsArray()
  past_members: number[];

  @IsArray()
  admins: number[]; 

  @IsArray()
  waiting_list: number[];

  @IsArray()
  allowed_email_domains: string[];

  @IsArray()
  allowed_emails: string[];

  @IsArray()
  restricted_email_domains: string[];

  @IsArray()
  restricted_emails: string[];

  @IsArray()
  quizzes_involved: number[];

  @IsBoolean()
  approval_required: boolean;

  @IsString()
  banner_type: string;

  @IsString()
  banner_url: string;

  @IsString()
  purpose: string;

  @IsString()
  category: string;

  @IsString()
  subject: string;
}