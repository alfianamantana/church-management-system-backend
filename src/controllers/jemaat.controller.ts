import { Request, Response } from 'express';
import { Jemaat } from '../model';
import Validator from 'validatorjs';
import { Op } from 'sequelize';

export const JemaatController = {
  async getAll(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, id, q } = req.query;

      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};

      if (q) {
        whereClause = {
          ...whereClause,
          name: { [Op.iLike]: `%${q}%` },
        };
      }

      if (id) {
        whereClause = { id: Number(id) };
      }

      const { count, rows } = await Jemaat.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        order: [['id', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: {
          total: count,
          page,
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },
  async updateJemaat(req: Request, res: Response) {
    try {
      const { id } = req.query;

      const rules = {
        id: 'required|numeric',
      };

      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const {
        name,
        birth_date,
        born_place,
        baptism_date,
        is_married,
        mom_id,
        dad_id,
      } = req.body;

      const jemaat = await Jemaat.findOne({ where: { id } });

      if (!jemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Jemaat not found'],
        });
      }

      if (typeof name !== 'undefined') jemaat.name = name;
      if (typeof birth_date !== 'undefined') jemaat.birth_date = birth_date;
      if (typeof born_place !== 'undefined') jemaat.born_place = born_place;
      if (typeof baptism_date !== 'undefined')
        jemaat.baptism_date = baptism_date;
      if (typeof is_married !== 'undefined') jemaat.is_married = is_married;
      if (typeof mom_id !== 'undefined') jemaat.mom_id = mom_id;
      if (typeof dad_id !== 'undefined') jemaat.dad_id = dad_id;

      await jemaat.save();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Jemaat updated successfully'],
        data: jemaat,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },
  async createJemaat(req: Request, res: Response) {
    try {
      const {
        name,
        birth_date,
        born_place,
        baptism_date,
        is_married,
        mom_id,
        dad_id,
        phone_number,
      } = req.body;

      const rules = {
        name: 'required|string',
        birth_date: 'required|date',
        born_place: 'required|string',
      };

      const validation = new Validator({ name, birth_date, born_place }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      await Jemaat.create({
        name,
        birth_date,
        born_place,
        baptism_date: baptism_date || null,
        is_married,
        mom_id: mom_id || null,
        dad_id: dad_id || null,
        phone_number: phone_number || null,
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
        message: ['Internal server error'],
        error: err,
      });
    }
  },
};
