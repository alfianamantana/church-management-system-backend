import { Request, Response } from 'express';
import { Jemaat } from '../model';
import Validator from 'validatorjs';

export const createJemaat = async (req: Request, res: Response) => {
  try {
    const { name, birthdate, bornplace, baptismdate, ismarried, momId, dadId } =
      req.body;

    const rules = {
      name: 'required|string',
      birthdate: 'required|date',
      bornplace: 'required|string',
    };

    const validation = new Validator({ name, birthdate, bornplace }, rules);
    if (validation.fails())
      return res.json({
        code: 400,
        status: 'error',
        message: validation.errors.all(),
      });

    await Jemaat.create({
      name,
      birthdate,
      bornplace,
      baptismdate: baptismdate || null,
      ismarried,
      momId: momId || null,
      dadId: dadId || null,
    });

    return res.json({
      code: 201,
      status: 'success',
      message: ['Jemaat created successfully'],
    });
  } catch (err) {
    return res.json({
      code: 500,
      status: 'error',
      message: ['Server error'],
      error: err,
    });
  }
};
