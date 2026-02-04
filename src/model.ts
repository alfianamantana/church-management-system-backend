import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';

@Table({
  tableName: 'families',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Family extends Model {
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
    comment: 'Nama keluarga',
  })
  name!: string;

  @HasMany(() => Jemaat)
  jemaats?: Jemaat[];
}

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

  @BelongsTo(() => Jemaat, 'dad_id')
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

  @Column({
    type: DataType.ENUM('male', 'female'),
    allowNull: false,
    defaultValue: 'male',
    field: 'gender',
  })
  gender!: 'male' | 'female';

  @ForeignKey(() => Family)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'family_id',
  })
  family_id?: number;

  @BelongsTo(() => Family)
  family?: Family;
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

  @HasMany(() => Event)
  events?: Event[];
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

@Table({
  tableName: 'events',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Event extends Model {
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
    type: DataType.STRING(255),
    allowNull: false,
    field: 'title',
  })
  title!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start',
  })
  start!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'end',
  })
  end!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'description',
  })
  description?: string;
}

@Table({
  tableName: 'members',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Member extends Model {
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
    type: DataType.STRING(30),
    allowNull: true,
    field: 'phone',
  })
  phone?: string;

  @HasMany(() => ServiceAssignment)
  serviceAssignments?: ServiceAssignment[];
}

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Role extends Model {
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
    field: 'role_name',
  })
  role_name!: string;

  @HasMany(() => ServiceAssignment)
  serviceAssignments?: ServiceAssignment[];
}

@Table({
  tableName: 'schedules',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Schedule extends Model {
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
    field: 'service_name',
  })
  service_name!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'scheduled_at',
  })
  scheduled_at!: Date;

  @HasMany(() => ServiceAssignment)
  serviceAssignments?: ServiceAssignment[];
}

@Table({
  tableName: 'service_assignments',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class ServiceAssignment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'schedule_id',
  })
  schedule_id!: number;

  @BelongsTo(() => Schedule)
  schedule!: Schedule;

  @ForeignKey(() => Member)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'member_id',
  })
  member_id!: number;

  @BelongsTo(() => Member)
  member!: Member;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'role_id',
  })
  role_id!: number;

  @BelongsTo(() => Role)
  role!: Role;
}

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
    comment: 'ID unik untuk kategori',
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Nama kategori transaksi',
  })
  name!: string;

  @Column({
    type: DataType.ENUM('income', 'expense'),
    allowNull: false,
  })
  type!: 'income' | 'expense';

  @HasMany(() => Transaction)
  transactions?: Transaction[];
}

@Table({
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
})
export class Transaction extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
    comment: 'ID unik untuk transaksi',
  })
  id!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: 'Tanggal transaksi',
  })
  date!: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID kategori yang terkait dengan transaksi',
  })
  category_id!: number;

  @BelongsTo(() => Category)
  category!: Category;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Nominal uang transaksi',
  })
  amount!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan untuk transaksi',
  })
  note?: string;
}
