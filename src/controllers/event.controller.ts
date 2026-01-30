import { Request, Response } from 'express';
import { Event } from '../model';
import Validator from 'validatorjs';
import { Op } from 'sequelize';

export const EventController = {
  async getAll(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, id, q, start, end } = req.query;

      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;
      const start_date = start ? new Date(String(start)) : null;
      const end_date = end ? new Date(String(end)) : null;

      let whereClause = {};

      if (q) {
        whereClause = {
          ...whereClause,
          title: { [Op.iLike]: `%${q}%` },
        };
      }

      if (start_date && end_date) {
        whereClause = {
          ...whereClause,
          start: { [Op.gte]: start_date },
          end: { [Op.lte]: end_date },
        };
      }

      if (id) {
        whereClause = { id: Number(id) };
      }

      const { count, rows } = await Event.findAndCountAll({
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
  async updateEvent(req: Request, res: Response) {
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

      const { title, start, end, description } = req.body;
      console.log(req.body, '??');

      const event = await Event.findOne({ where: { id } });

      if (!event) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Event not found'],
        });
      }

      if (typeof title !== 'undefined') event.title = title;
      if (typeof start !== 'undefined') event.start = start;
      if (typeof end !== 'undefined') event.end = end;
      if (typeof description !== 'undefined') event.description = description;

      await event.save();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Event updated successfully'],
        data: event,
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
  async createEvent(req: Request, res: Response) {
    try {
      const { title, start, end, description } = req.body;

      const rules = {
        title: 'required|string',
        start: 'required|date',
        end: 'required|date',
      };

      const validation = new Validator({ title, start, end }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      await Event.create({
        user_id: 1, // Placeholder user_id
        title,
        start,
        end,
        description: description || null,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: ['Event created successfully'],
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
  async deleteEvent(req: Request, res: Response) {
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

      const event = await Event.findOne({ where: { id } });

      if (!event) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Event not found'],
        });
      }

      await event.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Event deleted successfully'],
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
