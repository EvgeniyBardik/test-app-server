import { IsOptional, IsString } from 'class-validator';

export class FindQuery {
  @IsString()
  @IsOptional()
  sort: string;
  @IsString()
  @IsOptional()
  order: string;
}
