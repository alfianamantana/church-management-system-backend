import { Request, Response } from 'express';
import { Event, Church } from '../model';
import { Op } from 'sequelize';
import { validateField, getValidationRules } from '../helpers';

export const EventController = {
  async get(req: Request, res: Response) {
    try {
      const { church } = req;
      const { page = 1, limit = 10, id, q, start, end } = req.query;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const whereClause: any = { church_id: church?.id };

      if (q) whereClause.title = { [Op.iLike]: `%${q}%` };
      if (start && end) {
        whereClause.start = { [Op.gte]: new Date(String(start)) };
        whereClause.end = { [Op.lte]: new Date(String(end)) };
      }
      if (id) whereClause.id = Number(id);

      const { count, rows } = await Event.findAndCountAll({
        offset,
        limit: limitNum,
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
        pagination: { total: count, page: pageNum },
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
  async update(req: Request, res: Response) {
    try {
      const church = req.church;
      const { id } = req.query;

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id
      const idErrors = validateField(id, validationRules.event_id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      const { title, start, end, description } = req.body;

      const event = await Event.findOne({
        where: { id, church_id: church?.id },
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
  async create(req: Request, res: Response) {
    try {
      const { title, start, end, description } = req.body;

      // Get church from middleware
      const church = req.church;
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

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate required fields
      const titleErrors = validateField(title, validationRules.event_title);
      if (titleErrors.id) errorsId.push(titleErrors.id);
      if (titleErrors.en) errorsEn.push(titleErrors.en);

      const startErrors = validateField(start, validationRules.event_start);
      if (startErrors.id) errorsId.push(startErrors.id);
      if (startErrors.en) errorsEn.push(startErrors.en);

      const endErrors = validateField(end, validationRules.event_end);
      if (endErrors.id) errorsId.push(endErrors.id);
      if (endErrors.en) errorsEn.push(endErrors.en);

      // Validate optional description
      if (description !== undefined) {
        const descErrors = validateField(
          description,
          validationRules.event_description,
        );
        if (descErrors.id) errorsId.push(descErrors.id);
        if (descErrors.en) errorsEn.push(descErrors.en);
      }

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      await Event.create({
        church_id: church.id,
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
  async destroy(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id
      const idErrors = validateField(id, validationRules.event_id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      const event = await Event.findOne({
        where: { id, church_id: church?.id },
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
