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

  async getAllCompanies(order: string, reverse: string) {
    if (order === 'name' || order === 'serviceOfActivity') {
      const companies = await this.companyRepository.findAll({
        order: [[order, +reverse ? 'DESC' : 'ASC']],
      });
      return companies;
    }
    const companies = await this.companyRepository.findAll();
    return companies;
  }
  async getAllCompaniesFromUserId(
    userId: number,
    orderBy: string,
    reverse: string,
  ) {
    if (orderBy === 'name' || orderBy === 'serviceOfActivity') {
      const companies = await this.companyRepository.findAll({
        where: { userId },
        order: [[orderBy, +reverse ? 'DESC' : 'ASC']],
      });
      return companies;
    }
    const companies = await this.companyRepository.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
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
