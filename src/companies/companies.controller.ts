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
  USER_NOT_FOUND,
} from './companies.constants';
import { FindIdParams } from './dto/find-id-dto';
import { Company } from './companies.model';
import { UpdateCompanyDto } from './dto/update-company-dto';
import { DataFromToken } from 'src/decorators/data-from-token.decorator';
import { TokenData } from 'src/users/dto/token-user-data-dto';
import { UsersService } from 'src/users/users.service';
import { NOT_HAVE_ACCESS } from 'src/users/users.constants';
import { FindQuery } from './dto/query-params-dto';

@Controller('companies')
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
    private usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Body() companyDto: CreateCompanyDto,
    @DataFromToken() dataFromToken: TokenData,
  ) {
    const candidate = await this.companiesService.getCompanyByName(
      companyDto.name,
    );
    if (candidate) {
      throw new HttpException(THE_NAME_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }
    let userId = dataFromToken.id;
    if (dataFromToken.role === 'ADMIN') {
      userId = companyDto.userId ? companyDto.userId : +dataFromToken.id;
    }
    const userExist = await this.usersService.getUserById(userId.toString());
    if (!userExist) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    return await this.companiesService.createCompany({ ...companyDto, userId });
  }

  @Get()
  getAll(@DataFromToken() dataFromToken: TokenData, @Query() query: FindQuery) {
    const sort = query?.sort;
    const order = query?.order;
    if (dataFromToken.role === 'ADMIN') {
      return this.companiesService.getAllCompanies(sort, order);
    }
    return this.companiesService.getAllCompaniesFromUserId(
      dataFromToken.id,
      sort,
      order,
    );
  }

  @Delete(':id')
  async remove(
    @Param() params: FindIdParams,
    @DataFromToken() dataFromToken: TokenData,
  ): Promise<any> {
    const candidate = await this.companiesService.getCompanyById(params.id);
    if (!candidate) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    if (
      dataFromToken.role !== 'ADMIN' &&
      dataFromToken.id !== candidate.userId
    ) {
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
    @DataFromToken() dataFromToken: TokenData,
  ): Promise<Company> {
    const company = await this.companiesService.getCompanyById(params.id);
    if (!company) {
      throw new NotFoundException(COMPANY_NOT_FOUND_ERROR_ID);
    }
    if (dataFromToken.role !== 'ADMIN' && company.userId !== dataFromToken.id) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    return company;
  }

  @Patch(':id')
  async update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Param() params: FindIdParams,
    @DataFromToken() dataFromToken: TokenData,
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
    if (
      dataFromToken.role !== 'ADMIN' &&
      dataFromToken.id !== companyToUpdate.userId
    ) {
      throw new HttpException(NOT_HAVE_ACCESS, HttpStatus.FORBIDDEN);
    }
    const updateCompany = await this.companiesService.update(
      params.id,
      updateCompanyDto,
    );

    return updateCompany;
  }
}
