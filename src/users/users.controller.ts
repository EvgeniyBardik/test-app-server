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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/decorators/roles.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
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
import { FindQuery } from './dto/query-params-dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { Actions } from 'src/ability/actions.enum';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private ablilityFactory: AbilityFactory,
  ) {}

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
  async getOneFromToken(@GetUser() user: User): Promise<User> {
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return user;
  }

  @Get(':id')
  async getOneById(
    @Param() params: FindIdParams,
    @GetUser() user: User,
  ): Promise<User> {
    const userLookingFor = await this.usersService.getUserById(params.id);
    if (!userLookingFor) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Read, userLookingFor)) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    return userLookingFor;
  }

  @UseGuards(AdminGuard)
  @Get()
  async getAll(@Query() query: FindQuery) {
    const sort = query?.sort;
    const order = query?.order;
    return await this.usersService.getAllUsers(sort, order);
  }

  @Delete(':id')
  async remove(
    @Param() params: FindIdParams,
    @GetUser() user: User,
  ): Promise<any> {
    const candidate = await this.usersService.getUserById(params.id);
    if (!candidate) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Delete, candidate)) {
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
    @GetUser() user: User,
  ) {
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
    const candidate = await this.usersService.getUserById(params.id);
    if (!candidate) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }

    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Update, candidate)) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const updateUser = await this.usersService.update(params.id, updateUserDto);
    if (!updateUser) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR_ID);
    }
    return updateUser;
  }
}
