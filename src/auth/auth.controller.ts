import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import {
  THE_EMAIL_ALREADY_EXISTS,
  THE_NICK_NAME_ALREADY_EXISTS,
} from 'src/users/users.constants';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user-dto';
import { Public } from './public';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Get('check')
  async tokenCheck(@Headers('authorization') token: string | null) {
    const tokenToCheck = token?.split(' ')[1];
    return tokenToCheck ? this.authService.check(tokenToCheck) : null;
  }

  @Public()
  @Post('/signin')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post('/signup')
  async registration(@Body() createUserDto: CreateUserDto) {
    const hasTheSameEmail = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    const hasTheSameNickName = await this.usersService.getUserByNickName(
      createUserDto.nickName,
    );
    if (hasTheSameEmail) {
      throw new HttpException(THE_EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    if (hasTheSameNickName) {
      throw new HttpException(
        THE_NICK_NAME_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.authService.registration(createUserDto);
  }

  @Get('/logout')
  async logout(@GetUser() user: User) {
    const userLogout = this.authService.logout(user.id);
    return userLogout;
  }
}
