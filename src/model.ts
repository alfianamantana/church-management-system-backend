import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['created_at'] }, { fields: ['updated_at'] }],
})
export class UserRole extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
  })
  name!: string;
}

@Table({
  tableName: 'subscribe_types',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['created_at'] }, { fields: ['updated_at'] }],
})
export class SubscribeType extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
  })
  name!: string;

  @HasMany(() => User)
  users?: User[];
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['unique_key'], unique: true },
    { fields: ['email'], unique: true },
    { fields: ['superuser_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: true,
    field: 'unique_key',
  })
  unique_key?: string;

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

  @ForeignKey(() => UserRole)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'role_id',
  })
  role_id?: string;

  @BelongsTo(() => UserRole, { foreignKey: 'role_id', as: 'userRole' })
  userRole?: UserRole;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'subscribe_until',
  })
  subscribe_until?: Date;

  @ForeignKey(() => SubscribeType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'subscribe_type_id',
  })
  subscribe_type_id!: string;

  @BelongsTo(() => SubscribeType, {
    foreignKey: 'subscribe_type_id',
    as: 'subscribeType',
  })
  subscribeType?: SubscribeType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_jemaat_created',
  })
  total_jemaat_created!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_verified',
  })
  is_verified!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'superuser_id',
  })
  superuser_id?: string;

  @BelongsTo(() => User, { foreignKey: 'superuser_id', as: 'superuser' })
  superuser?: User;

  @HasMany(() => User, { foreignKey: 'superuser_id', as: 'subUsers' })
  subUsers?: User[];

  @BelongsToMany(() => Church, { through: () => UserChurch })
  churches?: Church[];

  @BelongsToMany(() => PriorityNeed, { through: () => UserPriorityNeed })
  priorityNeeds?: PriorityNeed[];

  @HasMany(() => UserOtp)
  userOtps?: UserOtp[];

  toJSON() {
    const values = { ...this.get() };
    // Include role from relationship if loaded
    if (this.userRole) {
      values.role = this.userRole.name;
    }
    // Include subscribe type from relationship if loaded
    if (this.subscribeType) {
      values.subscribe_type = this.subscribeType.name;
    }
    return values;
  }
}

@Table({
  tableName: 'user_otps',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class UserOtp extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING(6),
    allowNull: false,
  })
  code!: string;

  @Column({
    type: DataType.ENUM('activation', '2fa', 'reset_password', 'change_email'),
    allowNull: false,
  })
  type!: 'activation' | '2fa' | 'reset_password' | 'change_email';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expired_at',
  })
  expired_at!: Date;
}

@Table({
  tableName: 'churches',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Church extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

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
    field: 'city',
  })
  city!: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    field: 'phone_number',
  })
  phone_number!: string;

  @HasMany(() => Event)
  events?: Event[];

  @HasMany(() => Family)
  families?: Family[];

  @HasMany(() => Congregation)
  jemaats?: Congregation[];

  @HasMany(() => Schedule)
  schedules?: Schedule[];

  @HasMany(() => Member)
  members?: Member[];

  @HasMany(() => Role)
  roles?: Role[];

  @HasMany(() => Transaction)
  transactions?: Transaction[];

  @HasMany(() => Asset)
  assets?: Asset[];

  @BelongsToMany(() => User, { through: () => UserChurch })
  users?: User[];
}

@Table({
  tableName: 'families',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Family extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Nama keluarga',
  })
  name!: string;

  @HasMany(() => Congregation)
  jemaats?: Congregation[];
}

@Table({
  tableName: 'congregation',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['mom_id'] },
    { fields: ['dad_id'] },
    { fields: ['couple_id'] },
    { fields: ['church_id'] },
    { fields: ['family_id'] },
    { fields: ['birth_date'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Congregation extends Model {
  @ForeignKey(() => Congregation)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'mom_id',
  })
  mom_id?: string;

  @BelongsTo(() => Congregation, { foreignKey: 'mom_id', as: 'mom' })
  mom?: Congregation;

  @ForeignKey(() => Congregation)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'dad_id',
  })
  dad_id?: string;

  @BelongsTo(() => Congregation, { foreignKey: 'dad_id', as: 'dad' })
  dad?: Congregation;

  @ForeignKey(() => Congregation)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'couple_id',
  })
  couple_id?: string;

  @BelongsTo(() => Congregation, { foreignKey: 'couple_id', as: 'couple' })
  couple?: Congregation;

  @HasMany(() => Congregation, { foreignKey: 'mom_id', as: 'momChildren' })
  momChildren?: Congregation[];

  @HasMany(() => Congregation, { foreignKey: 'dad_id', as: 'dadChildren' })
  dadChildren?: Congregation[];
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
    type: DataType.UUID,
    allowNull: true,
    field: 'family_id',
  })
  family_id?: string;

  @BelongsTo(() => Family)
  family?: Family;
}

@Table({
  tableName: 'auths',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Auth extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  user_id!: string;

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
  indexes: [
    { fields: ['church_id'] },
    { fields: ['start'] },
    { fields: ['end'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Event extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
  indexes: [
    { fields: ['church_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Member extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
  tableName: 'role_service_assignment',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Role extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
  indexes: [
    { fields: ['church_id'] },
    { fields: ['scheduled_at'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Schedule extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
  indexes: [
    { fields: ['schedule_id'] },
    { fields: ['member_id'] },
    { fields: ['role_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class ServiceAssignment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'schedule_id',
  })
  schedule_id!: string;

  @BelongsTo(() => Schedule)
  schedule!: Schedule;

  @ForeignKey(() => Member)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'member_id',
  })
  member_id!: string;

  @BelongsTo(() => Member)
  member!: Member;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'role_id',
  })
  role_id!: string;

  @BelongsTo(() => Role)
  role!: Role;
}

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Category extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

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
  paranoid: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['category_id'] },
    { fields: ['date'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Transaction extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: 'Tanggal transaksi',
  })
  date!: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'ID kategori yang terkait dengan transaksi',
  })
  category_id!: string;

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

@Table({
  tableName: 'assets',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['acquisition_date'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Asset extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Nama asset',
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Deskripsi asset',
  })
  description?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Nilai asset',
  })
  value?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Tanggal perolehan asset',
    field: 'acquisition_date',
  })
  acquisition_date?: Date;

  @Column({
    type: DataType.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    allowNull: false,
    defaultValue: 'good',
  })
  condition!: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Lokasi asset',
  })
  location?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Kategori asset',
  })
  category?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan untuk asset',
  })
  notes?: string;
}

@Table({
  tableName: 'priority_needs',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['created_at'] }, { fields: ['updated_at'] }],
})
export class PriorityNeed extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'name',
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'description',
  })
  description?: string;

  @BelongsToMany(() => User, { through: () => UserPriorityNeed })
  users?: User[];
}

@Table({
  tableName: 'user_priority_needs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['priority_need_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class UserPriorityNeed extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => PriorityNeed)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'priority_need_id',
  })
  priority_need_id!: string;

  @BelongsTo(() => PriorityNeed)
  priorityNeed!: PriorityNeed;
}

@Table({
  tableName: 'user_churches',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['church_id'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class UserChurch extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  user_id!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'church_id',
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;
}
