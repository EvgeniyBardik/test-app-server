import { IsNumberString } from 'class-validator';

export class FindIdParams {
  @IsNumberString()
  id: string;
}
