import { IsOptional, IsString } from 'class-validator';
export class CreateUserDto {
  @IsString()
  email: string;
  @IsString()
  password: string;
  @IsString()
  phoneNumber: string;
  @IsString()
  lastName: string;
  @IsString()
  firstName: string;
  @IsString()
  nickName: string;
  @IsString()
  description: string;
  @IsString()
  position: string;
  @IsString()
  @IsOptional()
  role?: string;
  @IsString()
  @IsOptional()
  token?: string;
}
