import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'subscribe_types',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['is_public'] },
    { fields: ['is_active'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
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

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'description',
  })
  description?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'jemaat_limit',
  })
  jemaat_limit!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'admin_limit',
  })
  admin_limit!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_public',
  })
  is_public!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  is_active!: boolean;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    field: 'base_price_per_year',
  })
  base_price_per_year!: number;

  @HasMany(() => ChurchSubscription)
  churchSubscriptions?: ChurchSubscription[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'coupons',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['is_active'] },
    { fields: ['expired_at'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Coupon extends Model {
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
    unique: true,
    field: 'code',
  })
  code!: string;

  @Column({
    type: DataType.ENUM(
      'discount_percentage',
      'discount_fixed',
      'add_duration',
    ),
    allowNull: false,
  })
  type!: 'discount_percentage' | 'discount_fixed' | 'add_duration';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'remaining_quantity',
  })
  remaining_quantity?: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  is_active!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expired_at',
  })
  expired_at?: Date;

  @HasMany(() => Invoice)
  invoices?: Invoice[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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
    allowNull: false,
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
    allowNull: true,
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
    type: DataType.ENUM(
      'pending_activation',
      'active',
      'suspended',
      'disabled',
    ),
    allowNull: false,
    defaultValue: 'pending_activation',
  })
  status!: 'pending_activation' | 'active' | 'suspended' | 'disabled';

  @Column({
    type: DataType.ENUM('self', 'admin'),
    allowNull: false,
    defaultValue: 'self',
  })
  registration_source!: 'self' | 'admin';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'must_change_password',
  })
  must_change_password!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login_at',
  })
  last_login_at?: Date;

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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;

  toJSON() {
    const values = { ...this.get() };
    // Include role from relationship if loaded
    if (this.userRole) {
      values.role = this.userRole.name;
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
    type: DataType.ENUM(
      'activation',
      '2fa',
      'reset_password',
      'change_password',
    ),
    allowNull: false,
  })
  type!: 'activation' | '2fa' | 'reset_password' | 'change_password';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expired_at',
  })
  expired_at!: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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
  congregations?: Congregation[];

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

  @HasMany(() => ChurchSubscription)
  subscriptions?: ChurchSubscription[];

  @HasMany(() => Invoice)
  invoices?: Invoice[];

  @HasMany(() => Payment)
  payments?: Payment[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'church_subscriptions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['subscribe_type_id'] },
    { fields: ['status'] },
    { fields: ['started_at'] },
    { fields: ['ended_at'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class ChurchSubscription extends Model {
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

  @ForeignKey(() => SubscribeType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'subscribe_type_id',
  })
  subscribe_type_id!: string;

  @BelongsTo(() => SubscribeType)
  subscribeType!: SubscribeType;

  @HasMany(() => Invoice)
  invoices?: Invoice[];

  @HasMany(() => Payment)
  payments?: Payment[];

  @Column({
    type: DataType.ENUM('trial', 'active', 'past_due', 'expired', 'canceled'),
    allowNull: false,
    defaultValue: 'trial',
  })
  status!: 'trial' | 'active' | 'past_due' | 'expired' | 'canceled';

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    field: 'price_per_year',
  })
  price_per_year!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'jemaat_limit',
  })
  jemaat_limit!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'admin_limit',
  })
  admin_limit!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'started_at',
  })
  started_at!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'ended_at',
  })
  ended_at?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['subscription_id'] },
    { fields: ['coupon_id'] },
    { fields: ['status'] },
    { fields: ['due_date'] },
    { fields: ['paid_at'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Invoice extends Model {
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

  @ForeignKey(() => ChurchSubscription)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'subscription_id',
  })
  subscription_id!: string;

  @BelongsTo(() => ChurchSubscription)
  subscription!: ChurchSubscription;

  @ForeignKey(() => Coupon)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'coupon_id',
  })
  coupon_id?: string;

  @BelongsTo(() => Coupon)
  coupon?: Coupon;

  @HasMany(() => Payment)
  payments?: Payment[];

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.ENUM('pending', 'paid', 'canceled'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: 'pending' | 'paid' | 'canceled';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'due_date',
  })
  due_date!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'paid_at',
  })
  paid_at?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['church_id'] },
    { fields: ['subscription_id'] },
    { fields: ['invoice_id'] },
    { fields: ['status'] },
    { fields: ['payment_date'] },
    { fields: ['created_at'] },
    { fields: ['updated_at'] },
  ],
})
export class Payment extends Model {
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

  @ForeignKey(() => ChurchSubscription)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'subscription_id',
  })
  subscription_id!: string;

  @BelongsTo(() => ChurchSubscription)
  subscription!: ChurchSubscription;

  @ForeignKey(() => Invoice)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'invoice_id',
  })
  invoice_id?: string;

  @BelongsTo(() => Invoice)
  invoice?: Invoice;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.ENUM('transfer', 'credit_card', 'ewallet', 'manual'),
    allowNull: false,
  })
  payment_method!: 'transfer' | 'credit_card' | 'ewallet' | 'manual';

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'payment_date',
  })
  payment_date!: Date;

  @Column({
    type: DataType.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'transaction_reference',
  })
  transaction_reference!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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
  congregations?: any[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @BelongsTo(() => Family, { foreignKey: 'family_id', as: 'family' })
  family?: any;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'service_member',
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  created_at!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updated_at!: Date;
}

@Table({
  tableName: 'automations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'automation_due_index',
      fields: ['is_active', 'next_run_at'],
    },
    {
      fields: ['church_id'],
    },
    {
      fields: ['type'],
    },
  ],
})
export class Automation extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

  @Column({
    type: DataType.ENUM('birthday_greeting', 'service_assignment_notification'),
    allowNull: false,
  })
  type!: 'birthday_greeting' | 'service_assignment_notification';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  // 🔥 recurring rule (LOCAL time)
  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  send_time_local?: string; // "08:00:00"

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timezone!: string; // "Asia/Jakarta", "America/New_York"

  // 🔥 execution engine pakai ini (UTC)
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  next_run_at?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_run_at?: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  config?: any;
}

@Table({
  tableName: 'automation_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['automation_id'] },
    { fields: ['church_id'] },
    { fields: ['status'] },
  ],
})
export class AutomationLog extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => Automation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  automation_id!: string;

  @BelongsTo(() => Automation)
  automation!: Automation;

  @ForeignKey(() => Church)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  church_id!: string;

  @BelongsTo(() => Church)
  church!: Church;

  @Column({
    type: DataType.STRING,
  })
  recipient_phone!: string;

  @Column({
    type: DataType.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
  })
  status!: string;

  @Column({
    type: DataType.TEXT,
  })
  message!: string;
}
