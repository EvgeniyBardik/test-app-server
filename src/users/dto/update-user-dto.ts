import { IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
  @IsString()
  email: string;
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
  @IsNumber()
  @IsOptional()
  logoutTime: number;
}
