import dotenv from 'dotenv';
dotenv.config();
import './config/db.config';
import 'reflect-metadata';
import express, { Express } from "express"
import { router } from "./src/routes/index.route"
import cors from "cors"

const app: Express = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

router(app)

async function main(): Promise<void> {
    try {
        app.listen(PORT, (): void => {
            console.log(`⚡️ [SERVER]: Server running at localhost:${PORT}`)
        })
    } catch (err: any) {
        console.error(err)
        process.exit(1)
    }
}

main()
