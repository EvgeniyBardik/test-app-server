import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { User } from './users.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}
  async createUser(dto: CreateUserDto) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isAdmin = dto.email === adminEmail && dto.password === adminPassword;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(dto.password, salt);
    const user = await this.userRepository.create({
      ...dto,
      password: hashPassword,
      role: isAdmin ? 'ADMIN' : 'USER',
    });
    return user;
  }

  async getAllUsers(sort = 'email', order = 'ASC') {
    const users = await this.userRepository.findAll({ order: [[sort, order]] });
    return users;
  }
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }
  async getUserById(id: string) {
    const user = await this.userRepository.findByPk(id);
    return user;
  }
  async getUserByNickName(nickName: string) {
    const user = await this.userRepository.findOne({
      where: { nickName },
    });
    return user;
  }
  async remove(id: string) {
    const removeUser = await this.userRepository.findByPk(id);
    if (!removeUser) {
      return null;
    }
    removeUser.destroy();
    return removeUser;
  }
  async update(id, userDto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.getUserById(id);
    if (!userToUpdate) {
      return null;
    }
    return await userToUpdate.update(userDto);
  }
  async setLogoutTime(userToSet: User, dateTime: number | null) {
    const user = await userToSet.update({ logoutTime: dateTime });
    return user;
  }
}
