import dotenv from 'dotenv';
dotenv.config();

console.log('Environment loaded, starting application...');
console.log('DB_NAME from env:', process.env.DB_NAME);
console.log('DB_USER from env:', process.env.DB_USER);
console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD);
console.log(
  'All env:',
  Object.keys(process.env).filter(
    (key) => key.startsWith('DB_') || key === 'PORT',
  ),
);
console.log('Database config loaded...');
import './config/db.config';
import 'reflect-metadata';
import express, { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { CongregationRoutes } from './src/routes/jemaat.route';
import { UserRoutes } from './src/routes/user.route';
import { EventRoutes } from './src/routes/event.route';
import { MusicRoutes } from './src/routes/music.route';
import { TransactionRoutes } from './src/routes/transaction.route';
import { CategoryRoutes } from './src/routes/category.route';
import { FamilyRoutes } from './src/routes/family.routes';
import { DashboardRoutes } from './src/routes/dashboard.route';
import { AssetRoutes } from './src/routes/asset.route';
import { ChurchRoutes } from './src/routes/church.route';
import { PriorityNeedRoutes } from './src/routes/priority_need.route';
import { CouponRoutes } from './src/routes/coupon.route';
import { AutomationRoutes } from './src/routes/automation.route';
import UserRoleRoutes from './src/routes/user_role.route';
import auth_public from './src/middlewares/auth_public';
const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});

// app.use(limiter);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(auth_public);

const jemaatRouter = express.Router();
CongregationRoutes(jemaatRouter);
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

const churchRouter = express.Router();
ChurchRoutes(churchRouter);
app.use('/churches', churchRouter);

const priorityNeedRouter = express.Router();
PriorityNeedRoutes(priorityNeedRouter);
app.use('/priority-needs', priorityNeedRouter);

const couponRouter = express.Router();
CouponRoutes(couponRouter);
app.use('/coupons', couponRouter);

const automationRouter = express.Router();
AutomationRoutes(automationRouter);
app.use('/automations', automationRouter);

app.use('/user-roles', UserRoleRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    status: 'error',
    message: {
      id: ['Route tidak ditemukan'],
      en: ['Route not found'],
    },
  });
});

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
