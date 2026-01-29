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
  momId?: number;

  @BelongsTo(() => Jemaat, 'momId')
  mom?: Jemaat;

  @ForeignKey(() => Jemaat)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'dad_id',
  })
  dadId?: number;

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
  })
  name!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  birthdate!: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  bornplace!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  baptismdate?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  ismarried!: boolean;
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
  })
  name!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
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
  phoneNumber!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'subscribe_until',
  })
  subscribeUntil?: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'user',
  })
  role!: string;
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
  userId!: number;

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
  validUntil!: Date;
}
