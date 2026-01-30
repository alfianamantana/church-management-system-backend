import dotenv from 'dotenv';
dotenv.config();
import './config/db.config';
import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import { JemaatRoutes } from './src/routes/jemaat.route';
import { UserRoutes } from './src/routes/user.route';

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const jemaatRouter = express.Router();
JemaatRoutes(jemaatRouter);
app.use('/jemaat', jemaatRouter);

const userRouter = express.Router();
UserRoutes(userRouter);
app.use('/user', userRouter);

async function main(): Promise<void> {
  try {
    app.listen(PORT, (): void => {
      console.log(`⚡️ [SERVER]: Server running at localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error(err);
    process.exit(1);
  }
}

main();
