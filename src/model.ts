import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

@Table({
  tableName: 'jemaat',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Jemaat extends Model {
  @ForeignKey(() => Jemaat)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'mom_id',
  })
  mom_id?: number;

  @BelongsTo(() => Jemaat, 'mom_id')
  mom?: Jemaat;

  @ForeignKey(() => Jemaat)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'dad_id',
  })
  dad_id?: number;

  @BelongsTo(() => Jemaat, 'dadId')
  dad?: Jemaat;
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
  })
  name!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'birth_date',
  })
  birth_date!: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'born_place',
  })
  born_place!: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
    field: 'phone_number',
  })
  phone_number!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'baptism_date',
  })
  baptism_date?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_married',
  })
  is_married!: boolean;
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    field: 'email',
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'phone_number',
  })
  phone_number!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'subscribe_until',
  })
  subscribe_until?: Date;

  @Column({
    type: DataType.ENUM('superadmin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  })
  role!: 'superadmin' | 'user';

  @Column({
    type: DataType.ENUM('basic', 'full'),
    allowNull: false,
    defaultValue: 'basic',
    field: 'subscribe_type',
  })
  subscribe_type!: 'basic' | 'full';
}

@Table({
  tableName: 'auths',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Auth extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  user_id!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'valid_until',
  })
  valid_until!: Date;
}
