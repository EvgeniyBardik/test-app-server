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
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company-dto';
import { CompaniesService } from './companies.service';
import {
  COMPANY_NOT_FOUND_ERROR_ID,
  THE_NAME_ALREADY_EXISTS,
} from './companies.constants';
import { FindIdParams } from './dto/find-id-dto';
import { Company } from './companies.model';
import { UpdateCompanyDto } from './dto/update-company-dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UsersService } from 'src/users/users.service';
import { NOT_HAVE_ACCESS } from 'src/users/users.constants';
import { FindQuery } from './dto/query-params-dto';
import { AbilityFactory } from 'src/ability/ability.factory';
import { User } from 'src/users/users.model';
import { Actions } from 'src/ability/actions.enum';

@Controller('companies')
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
    private usersService: UsersService,
    private ablilityFactory: AbilityFactory,
  ) {}

  @Post()
  async create(@Body() companyDto: CreateCompanyDto, @GetUser() user: User) {
    const candidate = await this.companiesService.getCompanyByName(
      companyDto.name,
    );
    if (candidate) {
      throw new HttpException(THE_NAME_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    return await this.companiesService.createCompany({
      ...companyDto,
      userId: user.id,
    });
  }

  @Get()
  getAll(@GetUser() user: User, @Query() query: FindQuery) {
    const sort = query?.sort;
    const order = query?.order;
    if (user.role === 'ADMIN') {
      return this.companiesService.getAllCompanies(sort, order);
    }
    return this.companiesService.getAllCompaniesFromUserId(
      user.id,
      sort,
      order,
    );
  }

  @Delete(':id')
  async remove(
    @Param() params: FindIdParams,
    @GetUser() user: User,
  ): Promise<any> {
    const candidate = await this.companiesService.getCompanyById(params.id);
    if (!candidate) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Delete, candidate)) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const deleteCompany = await this.companiesService.remove(params.id);
    if (!deleteCompany) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    return deleteCompany;
  }

  @Get(':id')
  async getOneById(
    @Param() params: FindIdParams,
    @GetUser() user: User,
  ): Promise<Company> {
    const company = await this.companiesService.getCompanyById(params.id);
    if (!company) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Read, company)) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    return company;
  }

  @Patch(':id')
  async update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Param() params: FindIdParams,
    @GetUser() user: User,
  ) {
    const companyToUpdate = await this.companiesService.getCompanyById(
      params.id,
    );
    if (!companyToUpdate) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    const hasSameName = await this.companiesService.getCompanyByName(
      updateCompanyDto.name,
    );
    if (hasSameName && hasSameName.id !== +params.id) {
      throw new HttpException(THE_NAME_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    const ability = this.ablilityFactory.createForUser(user);
    if (!ability.can(Actions.Update, companyToUpdate)) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const updateCompany = await this.companiesService.update(
      params.id,
      updateCompanyDto,
    );

    return updateCompany;
  }
}
