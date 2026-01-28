import 'dotenv/config'
import express, { Express } from "express"
import { router } from "./src/routes/index.route"
import cors from "cors"

// initial
const app: Express = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000

// setup
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// route
router(app)

// running
function main(): void {
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
