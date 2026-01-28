import { Request, Response } from "express"

export const IndexController = {

    index(req: Request, res: Response): Response {

        return res.send({
            status: true,
            code: 200,
            message: "Hello world"
        })
    },

    fallback(req: Request, res: Response): Response {
        return res.status(404).send({
            status: false,
            code: 404,
            message: "route not found",
            error: {
                path: req.path,
                method: req.method,
                baseURL: req.baseUrl
            }
        })
    }
}
