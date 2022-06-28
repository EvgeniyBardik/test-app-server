import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './companies.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [CompaniesService, UsersService],
  controllers: [CompaniesController],
  imports: [SequelizeModule.forFeature([Company, User]), UsersModule],
})
export class CompaniesModule {}
