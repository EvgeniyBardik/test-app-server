import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DataFromToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
