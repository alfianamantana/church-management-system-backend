import { Sequelize } from 'sequelize-typescript';
import { User, Auth } from '../src/model';

const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  dialect: 'postgres',
  dialectOptions: {
    connectTimeout: 30000,
    ssl: process.env.SSL === "false" ? false : {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  },
  logging: false,
  models: [User, Auth],
});

sequelize.sync();

export default sequelize;