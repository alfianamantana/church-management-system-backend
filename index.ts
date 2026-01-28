import express, { Express, Request, Response } from "express"
import cors from "cors"

// initial
const app: Express = express()
const PORT: number = 8000

// setup
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// route
app.get("/", (req: Request, res: Response): Response => {
    return res.send("Hello world")
})

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