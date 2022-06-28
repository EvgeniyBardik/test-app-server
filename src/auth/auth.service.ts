import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'src/users/users.model';
import {
  USER_NOT_FOUND_ERROR_EMAIL,
  USER_NOT_FOUND_ERROR_ID,
} from 'src/users/users.constants';
import { WRONG_PASSWORD_ERROR } from './auth.constants';
import { GetUserDto } from 'src/users/dto/get-user-dto';
import { TokenData } from 'src/users/dto/token-user-data-dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(getUserDto: GetUserDto) {
    const payload = {
      email: getUserDto.email,
      id: getUserDto.id,
      role: getUserDto.role,
    };
    return {
      user: getUserDto,
      token: await this.jwtService.signAsync(payload),
    };
  }

  async check(token: string) {
    const userInfoFromToken = this.jwtService.decode(token) as TokenData;
    const user = await this.usersService.getUserById(
      userInfoFromToken.id.toString(),
    );
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_EMAIL);
    }
    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      throw new BadRequestException(WRONG_PASSWORD_ERROR);
    }
    return user;
  }

  async registration(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.createUser(createUserDto);
    const payload = {
      id: newUser.id,
      role: newUser.role,
    };
    return { user: newUser, token: this.jwtService.sign(payload) };
  }
  async logout(userId) {
    const userToLogout = await this.usersService.getUserById(userId);
    if (!userToLogout) {
      throw new NotFoundException('User not found');
    }
    const dateLogout = Date.now();
    const userSetLogoutTime = await this.usersService.getUserById(userId);
    if (!userSetLogoutTime) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    const user = await this.usersService.setLogoutTime(
      userSetLogoutTime,
      dateLogout,
    );
    return user;
  }
}
