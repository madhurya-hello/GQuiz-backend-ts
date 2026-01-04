import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsDateString, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  status: string; 

  @IsDateString()
  validity_quiz_start: string;

  @IsDateString()
  validity_quiz_end: string;

  @IsNumber()
  quiz_duration: number;

  @IsOptional()
  @IsArray() 
  constraints?: any;

  @IsOptional()
  @IsArray() 
  upon_violation?: any;

  @IsOptional()
  @IsObject()
  quiz_access?: any; 

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_emails?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blocked_emails?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_email_domains?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blocked_email_domains?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allowed_classes?: number[];

  @IsNotEmpty()
  quiz_section: any; 
}