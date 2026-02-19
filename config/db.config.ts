import { Sequelize } from 'sequelize-typescript';
import {
  User,
  Auth,
  Congregation,
  Event,
  Member,
  Role,
  Schedule,
  ServiceAssignment,
  Transaction,
  Category,
  Family,
  Asset,
  Church,
  PriorityNeed,
  UserPriorityNeed,
  UserRole,
  UserOtp,
  UserChurch,
  SubscribeType,
  ChurchSubscription,
  Payment,
  Invoice,
  PlanTier,
  Coupon,
} from '../src/model';

console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'church',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  dialectOptions: {
    useUTC: true,
    connectTimeout: 30000,
    ssl: false,
  },
  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+00:00',
  define: {
    // PostgreSQL doesn't use charset/collate in the same way
  },
  logging: false,
  models: [
    User,
    Category,
    Family,
    Congregation,
    Member,
    Role,
    Schedule,
    ServiceAssignment,
    Transaction,
    Asset,
    Event,
    Auth,
    Church,
    PriorityNeed,
    UserPriorityNeed,
    UserRole,
    UserOtp,
    UserChurch,
    SubscribeType,
    ChurchSubscription,
    Payment,
    Invoice,
    PlanTier,
    Coupon,
  ],
});

sequelize.sync();

export default sequelize;
