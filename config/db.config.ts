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
} from '../src/model';

const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  dialect: 'postgres',
  dialectOptions: {
    useUTC: true,
    connectTimeout: 30000,
    ssl:
      process.env.SSL === 'false'
        ? false
        : {
            require: true,
            rejectUnauthorized: false,
          },
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
  ],
});

sequelize.sync();

export default sequelize;
