import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCompanyDto } from './dto/create-company-dto';
import { Company } from './companies.model';
import { UpdateCompanyDto } from './dto/update-company-dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company) private companyRepository: typeof Company,
  ) {}
  async createCompany(dto: CreateCompanyDto) {
    const company = await this.companyRepository.create(dto);
    return company;
  }

  async getAllCompanies(sort = 'updatedAt', order = 'ASC') {
    const companies = await this.companyRepository.findAll({
      order: [[sort, order]],
    });
    return companies;
  }
  async getAllCompaniesFromUserId(
    userId: number,
    sort = 'updatedAt',
    order = 'ASC',
  ) {
    const companies = await this.companyRepository.findAll({
      where: { userId },
      order: [[sort, order]],
    });
    return companies;
  }

  async getCompanyByName(name: string) {
    const company = await this.companyRepository.findOne({ where: { name } });
    return company;
  }
  async getCompanyById(id: string) {
    const company = await this.companyRepository.findByPk(id);
    return company;
  }
  async remove(id: string) {
    const removeCompany = await this.companyRepository.findByPk(id);
    if (!removeCompany) {
      return null;
    }
    removeCompany.destroy();
    return removeCompany;
  }
  async update(id, companyDto: UpdateCompanyDto): Promise<Company> {
    const companyToUpdate = await this.getCompanyById(id);
    if (!companyToUpdate) {
      return null;
    }
    return companyToUpdate.update(companyDto);
  }
}
