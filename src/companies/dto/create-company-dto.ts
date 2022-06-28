import { IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateCompanyDto {
  @IsString()
  name: string;
  @IsString()
  address: string;
  @IsString()
  serviceOfActivity: string;
  @IsNumber()
  numberOfEmployees: number;
  @IsString()
  type: string;
  @IsString()
  description: string;
  @IsOptional()
  @IsNumber()
  userId?: number;
}
