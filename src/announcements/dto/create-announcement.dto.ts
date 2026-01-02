import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsNumberString, IsDateString } from 'class-validator';
import { AnnouncementType, AnnouncementState } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @IsNumberString() 
  class_id: number;

  @IsOptional()
  @IsNumberString()
  quiz_id?: number;

  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @IsEnum(AnnouncementState)
  state: AnnouncementState;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty() 
  description: string;

  @IsOptional() 
  @IsArray()
  materials: any[]; 

  @IsOptional()
  @IsNumberString()
  total_marks?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string; 

  @IsOptional()
  @IsDateString()
  schedule_time?: string; 
}