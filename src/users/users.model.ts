import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Company } from 'src/companies/companies.model';

interface UserCreationAttrs {
  email: string;
  password: string;
  phoneNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  description: string;
  position: string;
  role?: string;
  logoutTime?: number;
}

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  nickName: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  position: string;
  @Column({
    type: DataType.STRING,
    defaultValue: 'USER',
  })
  role: string;
  @Column({
    type: DataType.BIGINT,
  })
  logoutTime: number;

  @HasMany(() => Company)
  companies: Company[];
}
