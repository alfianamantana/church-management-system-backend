import dotenv from 'dotenv';
dotenv.config();
console.log('Environment loaded, starting application...');
import './config/db.config';
console.log('Database config loaded...');
import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import { JemaatRoutes } from './src/routes/jemaat.route';
import { UserRoutes } from './src/routes/user.route';
import { EventRoutes } from './src/routes/event.route';
import { MusicRoutes } from './src/routes/music.route';
import { TransactionRoutes } from './src/routes/transaction.route';
import { CategoryRoutes } from './src/routes/category.route';
import { FamilyRoutes } from './src/routes/family.routes';
import { DashboardRoutes } from './src/routes/dashboard.route';
import { AssetRoutes } from './src/routes/asset.route';

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

const eventRouter = express.Router();
EventRoutes(eventRouter);
app.use('/events', eventRouter);

const musicRouter = express.Router();
MusicRoutes(musicRouter);
app.use('/music', musicRouter);

const transactionRouter = express.Router();
TransactionRoutes(transactionRouter);
app.use('/transactions', transactionRouter);

const categoryRouter = express.Router();
CategoryRoutes(categoryRouter);
app.use('/categories', categoryRouter);

const familyRouter = express.Router();
FamilyRoutes(familyRouter);
app.use('/families', familyRouter);

const dashboardRouter = express.Router();
DashboardRoutes(dashboardRouter);
app.use('/dashboard', dashboardRouter);

const assetRouter = express.Router();
AssetRoutes(assetRouter);
app.use('/assets', assetRouter);

async function main(): Promise<void> {
  try {
    console.log('Starting server...');
    app.listen(PORT, (): void => {
      console.log(`⚡️ [SERVER]: Server running at localhost:${PORT}`);
      console.log('Server started successfully!');
    });
  } catch (err: any) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

main();
