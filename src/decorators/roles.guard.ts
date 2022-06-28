import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { NOT_HAVE_ACCESS } from 'src/users/users.constants';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const { role } = request.user;
    if (role !== 'ADMIN') {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
