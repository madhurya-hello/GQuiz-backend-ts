import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() middle_name?: string;
  @IsOptional() @IsString() last_name?: string;
  @IsOptional() @IsString() dob?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsBoolean() phone_verified?: boolean;
  @IsOptional() @IsBoolean() email_verified?: boolean;
  
  @IsOptional() @IsArray() hidden_elements?: string[];
  @IsOptional() @IsArray() notifications?: any[];
  @IsOptional() @IsArray() starred_quizzes?: number[];

  @IsOptional() @IsString() profile_photo_url?: string;
  @IsOptional() @IsString() profile_banner_url?: string;

  // Academic & Social fields mapped to JSON
  @IsOptional() @IsString() linkedin_url?: string;
  @IsOptional() @IsString() instagram_url?: string;
  @IsOptional() @IsString() facebook_url?: string;
  @IsOptional() @IsString() twitter_url?: string;

  @IsOptional() @IsString() university_name?: string;
  @IsOptional() @IsString() current_semester?: string;
  @IsOptional() @IsString() current_college_section?: string;
  @IsOptional() @IsString() current_cgpa?: string;
  @IsOptional() @IsString() school_name?: string;
  @IsOptional() @IsString() current_standard?: string;
  @IsOptional() @IsString() current_school_section?: string;
  @IsOptional() @IsString() roll_no?: string;
}