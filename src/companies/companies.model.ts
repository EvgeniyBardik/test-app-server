import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users.model';

interface CompanyCreationAttrs {
  name: string;
  address: string;
  serviceOfActivity: string;
  numberOfEmployees: number;
  type: string;
  description: string;
  userId: number;
}

@Table({ tableName: 'companies', underscored: true })
export class Company extends Model<Company, CompanyCreationAttrs> {
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
  name: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  serviceOfActivity: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  numberOfEmployees: number;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  owner: User;
}
