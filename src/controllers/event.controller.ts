import { Request, Response } from 'express';
import { Event, Church, UserChurch } from '../model';
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

      // Get church for the user
      const userChurch = await UserChurch.findOne({
        where: { user_id: req.user?.id },
      });
      const church = userChurch
        ? await Church.findOne({ where: { id: userChurch.church_id } })
        : null;
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      let whereClause: any = {
        church_id: church.id,
      };

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
        whereClause = { ...whereClause, id: Number(id) };
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
        message: {
          id: ['Acara berhasil diambil'],
          en: ['Events retrieved successfully'],
        },
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

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: req.user?.id } });
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      const event = await Event.findOne({
        where: { id, church_id: church.id },
      });

      if (!event) {
        return res.json({
          code: 404,
          status: 'error',
          message: { id: ['Acara tidak ditemukan'], en: ['Event not found'] },
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
        message: {
          id: ['Acara berhasil diperbarui'],
          en: ['Event updated successfully'],
        },
        data: event,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
  async createEvent(req: Request, res: Response) {
    try {
      const { church_id, title, start, end, description } = req.body;

      const rules = {
        church_id: 'required|integer',
        title: 'required|string',
        start: 'required|date',
        end: 'required|date',
      };

      const validation = new Validator({ church_id, title, start, end }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      await Event.create({
        church_id,
        title,
        start,
        end,
        description: description || null,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Acara berhasil dibuat'],
          en: ['Event created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
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

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: req.user?.id } });
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      const event = await Event.findOne({
        where: { id, church_id: church.id },
      });

      if (!event) {
        return res.json({
          code: 404,
          status: 'error',
          message: { id: ['Acara tidak ditemukan'], en: ['Event not found'] },
        });
      }

      await event.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Acara berhasil dihapus'],
          en: ['Event deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
};
