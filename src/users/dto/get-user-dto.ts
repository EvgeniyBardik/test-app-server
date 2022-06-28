import { IsNumber, IsOptional, IsString } from 'class-validator';
export class GetUserDto {
  @IsNumber()
  id: number;
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
  role: string;
  @IsNumber()
  @IsOptional()
  logoutTime: number;
}
