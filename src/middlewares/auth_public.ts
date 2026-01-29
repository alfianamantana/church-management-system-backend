import { NextFunction, Request, Response } from "express"

export const auth_public = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization']

  if (!authorization) {
    return res.json({
      code: 401,
      status: 'error',
      message: 'Unauthorized access',
      result: [],
    });
  }
  // if (authorization !== auth_key) {
  //   return res.json({
  //     code: 403,
  //     status: 'error',
  //     message: 'Forbidden access',
  //     result: [],
  //   });
  // }
  next();
}