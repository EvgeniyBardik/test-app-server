import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/decorators/roles.guard';
import { DataFromToken } from 'src/decorators/data-from-token.decorator';
import { CreateUserDto } from './dto/create-user-dto';
import { FindIdParams } from './dto/find-id-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import {
  NOT_HAVE_ACCESS,
  THE_EMAIL_ALREADY_EXISTS,
  THE_NICK_NAME_ALREADY_EXISTS,
  USER_NOT_FOUND_ERROR_ID,
} from './users.constants';
import { User } from './users.model';
import { UsersService } from './users.service';
import { TokenData } from './dto/token-user-data-dto';
import { Public } from 'src/auth/public';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() userDto: CreateUserDto) {
    const oldUser = await this.usersService.getUserByEmail(userDto.email);
    if (oldUser) {
      throw new HttpException(THE_EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    const nickNameExists = await this.usersService.getUserByNickName(
      userDto.nickName,
    );
    if (nickNameExists) {
      throw new HttpException(
        THE_NICK_NAME_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.createUser(userDto);
  }
  @Get('profile')
  async getOneFromToken(
    @DataFromToken() dataFromToken: TokenData,
  ): Promise<User> {
    const user = await this.usersService.getUserById(
      dataFromToken.id.toString(),
    );
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return user;
  }

  @Get(':id')
  async getOneById(
    @Param() params: FindIdParams,
    @DataFromToken() dataFromToken: TokenData,
  ): Promise<User> {
    if (dataFromToken.id !== +params.id && dataFromToken.role !== 'ADMIN') {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const user = await this.usersService.getUserById(params.id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return user;
  }

  @UseGuards(AdminGuard)
  @Get()
  async getAll() {
    return await this.usersService.getAllUsers();
  }

  @Delete(':id')
  async remove(
    @Param() params: FindIdParams,
    @DataFromToken() dataFromToken: TokenData,
  ): Promise<any> {
    if (dataFromToken.id !== +params.id && dataFromToken.role !== 'ADMIN') {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const deleteUser = await this.usersService.remove(params.id);
    if (!deleteUser) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return deleteUser;
  }

  @Patch(':id')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Param() params: FindIdParams,
    @DataFromToken() dataFromToken: TokenData,
  ) {
    if (dataFromToken.id !== +params.id && dataFromToken.role !== 'ADMIN') {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const hasTheSameEmail = await this.usersService.getUserByEmail(
      updateUserDto.email,
    );
    const hasTheSameNickName = await this.usersService.getUserByNickName(
      updateUserDto.nickName,
    );
    if (hasTheSameEmail && hasTheSameEmail.id !== +params.id) {
      throw new HttpException(THE_EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    if (hasTheSameNickName && hasTheSameNickName.id !== +params.id) {
      throw new HttpException(
        THE_NICK_NAME_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateUser = await this.usersService.update(params.id, updateUserDto);
    if (!updateUser) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return updateUser;
  }
}
