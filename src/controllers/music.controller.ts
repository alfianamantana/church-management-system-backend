import { Request, Response } from 'express';
import { Member, Role, Schedule, ServiceAssignment } from '../model';
import {
  validateField,
  getValidationRules,
  validateArray,
  validateArrayEn,
} from '../helpers';
import { Op, Includeable } from 'sequelize';

interface IScheduleInput {
  service_name: string;
  scheduled_at: Date;
  instruments_assignments?: {
    [key: string]: number[]; // instrument_id: member_id[]
  };
}

export const MusicController = {
  // Member CRUD
  async getMembers(req: Request, res: Response) {
    try {
      const { church } = req;
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause: any = {
        church_id: church?.id,
      };
      if (q) {
        whereClause = { ...whereClause, name: { [Op.iLike]: `%${q}%` } };
      }

      const { count, rows } = await Member.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        order: [['id', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async createMember(req: Request, res: Response) {
    try {
      const { church } = req;
      const { name, phone } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields: any = {
        name: { value: name, rules: validationRules.name },
      };

      // Optional validations
      if (phone !== undefined) {
        fields.phone = { value: phone, rules: validationRules.phone_number };
      }

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(
          (config as any).value,
          (config as any).rules,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });

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

      await Member.create({ church_id: church?.id, name, phone });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Anggota berhasil dibuat'],
          en: ['Member created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async updateMember(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;
      const { name, phone } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id
      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      // Optional validations
      if (name !== undefined) {
        const nameErrors = validateField(name, validationRules.name);
        if (nameErrors.id) errorsId.push(nameErrors.id);
        if (nameErrors.en) errorsEn.push(nameErrors.en);
      }

      if (phone !== undefined) {
        const phoneErrors = validateField(phone, validationRules.phone_number);
        if (phoneErrors.id) errorsId.push(phoneErrors.id);
        if (phoneErrors.en) errorsEn.push(phoneErrors.en);
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

      const member = await Member.findOne({
        where: { id: Number(id), church_id: church?.id },
      });

      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Anggota tidak ditemukan'],
            en: ['Member not found'],
          },
        });
      }

      if (name) member.name = name;
      if (phone !== undefined) member.phone = phone;
      await member.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Anggota berhasil diperbarui'],
          en: ['Member updated successfully'],
        },
        data: member,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async deleteMember(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

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

      const member = await Member.findOne({
        where: { id: Number(id), church_id: church?.id },
      });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Anggota tidak ditemukan'],
            en: ['Member not found'],
          },
        });
      }

      await member.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Anggota berhasil dihapus'],
          en: ['Member deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  // Role CRUD
  async getRoles(req: Request, res: Response) {
    try {
      const { church } = req;
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause: any = {
        church_id: church?.id,
      };
      if (q) {
        whereClause = { ...whereClause, role_name: { [Op.iLike]: `%${q}%` } };
      }

      const { count, rows } = await Role.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        order: [['id', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  async createRole(req: Request, res: Response) {
    try {
      const { church } = req;
      const { role_name } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const roleNameErrors = validateField(role_name, validationRules.name);
      if (roleNameErrors.id) errorsId.push(roleNameErrors.id);
      if (roleNameErrors.en) errorsEn.push(roleNameErrors.en);

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

      await Role.create({ church_id: church?.id, role_name });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Peran berhasil dibuat'],
          en: ['Role created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async updateRole(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;
      const { role_name } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      if (role_name !== undefined) {
        const roleNameErrors = validateField(role_name, validationRules.name);
        if (roleNameErrors.id) errorsId.push(roleNameErrors.id);
        if (roleNameErrors.en) errorsEn.push(roleNameErrors.en);
      }

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

      const role = await Role.findOne({
        where: { id: Number(id), church_id: church?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Peran tidak ditemukan'],
            en: ['Role not found'],
          },
        });
      }

      if (role_name) role.role_name = role_name;
      await role.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Peran berhasil diperbarui'],
          en: ['Role updated successfully'],
        },
        data: role,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async deleteRole(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

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

      const role = await Role.findOne({
        where: { id: Number(id), church_id: church?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Peran tidak ditemukan'],
            en: ['Role not found'],
          },
        });
      }

      await role.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Peran berhasil dihapus'],
          en: ['Role deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  // Schedule CRUD
  async getSchedules(req: Request, res: Response) {
    try {
      const { church } = req;
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      const musician = req.query.musician === 'true';
      const id = req.query.id ? Number(req.query.id) : null;
      let include: Includeable[] = [];
      if (musician) {
        include = [
          {
            model: ServiceAssignment,
            as: 'serviceAssignments',
            include: [
              { model: Member, as: 'member' },
              { model: Role, as: 'role' },
            ],
          },
        ];
      }

      let whereClause: any = {
        church_id: church?.id,
      };

      if (id) {
        whereClause = { ...whereClause, id };
      }

      if (q) {
        whereClause = {
          ...whereClause,
          service_name: { [Op.iLike]: `%${q}%` },
        };
      }

      const { count, rows } = await Schedule.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        order: [['scheduled_at', 'ASC']],
        include,
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  async getSchedule(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

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

      const schedule = await Schedule.findOne({
        where: { id: Number(id), church_id: church?.id },
        include: [
          {
            model: ServiceAssignment,
            as: 'serviceAssignments',
            include: [
              { model: Member, as: 'member' },
              { model: Role, as: 'role' },
            ],
          },
        ],
      });

      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Jadwal tidak ditemukan'],
            en: ['Schedule not found'],
          },
        });
      }

      return res.json({
        code: 200,
        status: 'success',
        data: schedule,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async createSchedule(req: Request, res: Response) {
    let transaction;
    try {
      const { church } = req;
      const { schedules = [] } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate schedules array
      const schedulesErrors = validateField(schedules, {
        id: [{ validator: validateArray, args: ['jadwal'] }],
        en: [{ validator: validateArrayEn, args: ['schedules'] }],
      });
      if (schedulesErrors.id) errorsId.push(schedulesErrors.id);
      if (schedulesErrors.en) errorsEn.push(schedulesErrors.en);

      // Validate each schedule item
      for (let i = 0; i < schedules.length; i++) {
        const sch = schedules[i];
        const serviceNameErrors = validateField(
          sch.service_name,
          validationRules.name,
        );
        if (serviceNameErrors.id)
          errorsId.push(`Jadwal ${i + 1}: ${serviceNameErrors.id}`);
        if (serviceNameErrors.en)
          errorsEn.push(`Schedule ${i + 1}: ${serviceNameErrors.en}`);

        const scheduledAtErrors = validateField(
          sch.scheduled_at,
          validationRules.date,
        );
        if (scheduledAtErrors.id)
          errorsId.push(`Jadwal ${i + 1}: ${scheduledAtErrors.id}`);
        if (scheduledAtErrors.en)
          errorsEn.push(`Schedule ${i + 1}: ${scheduledAtErrors.en}`);
      }

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

      transaction = await Schedule.sequelize?.transaction();

      for (const sch of schedules) {
        let createdSchedule = await Schedule.create(
          {
            church_id: church?.id,
            service_name: sch.service_name,
            scheduled_at: sch.scheduled_at,
          },
          { transaction },
        );

        // Handle instrument assignments if provided
        if (sch.instrument_assignments) {
          for (const instrument_id in sch.instrument_assignments) {
            const member_ids: string[] =
              sch.instrument_assignments[instrument_id];
            for (const member_id of member_ids) {
              await ServiceAssignment.create(
                {
                  schedule_id: createdSchedule.id,
                  member_id,
                  role_id: instrument_id, // assuming instrument_id maps to role_id
                },
                { transaction },
              );
            }
          }
        }
      }

      await transaction?.commit();

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Jadwal berhasil dibuat'],
          en: ['Schedules created successfully'],
        },
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async updateSchedule(req: Request, res: Response) {
    let transaction;
    try {
      const { church } = req;
      const { schedules = [] } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate schedules array
      const schedulesErrors = validateField(schedules, {
        id: [{ validator: validateArray, args: ['jadwal'] }],
        en: [{ validator: validateArrayEn, args: ['schedules'] }],
      });
      if (schedulesErrors.id) errorsId.push(schedulesErrors.id);
      if (schedulesErrors.en) errorsEn.push(schedulesErrors.en);

      // Validate each schedule item
      for (let i = 0; i < schedules.length; i++) {
        const sch = schedules[i];
        const serviceNameErrors = validateField(
          sch.service_name,
          validationRules.name,
        );
        if (serviceNameErrors.id)
          errorsId.push(`Jadwal ${i + 1}: ${serviceNameErrors.id}`);
        if (serviceNameErrors.en)
          errorsEn.push(`Schedule ${i + 1}: ${serviceNameErrors.en}`);

        const scheduledAtErrors = validateField(
          sch.scheduled_at,
          validationRules.date,
        );
        if (scheduledAtErrors.id)
          errorsId.push(`Jadwal ${i + 1}: ${scheduledAtErrors.id}`);
        if (scheduledAtErrors.en)
          errorsEn.push(`Schedule ${i + 1}: ${scheduledAtErrors.en}`);
      }

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

      transaction = await Schedule.sequelize?.transaction();

      for (const sch of schedules) {
        let schedule;
        if (sch.id) {
          // Update existing schedule
          schedule = await Schedule.findOne({
            where: { id: sch.id, church_id: church?.id },
            transaction,
          });
          if (!schedule) {
            if (transaction) {
              await transaction.rollback();
            }
            return res.json({
              code: 404,
              status: 'error',
              message: {
                id: [`Jadwal dengan ID ${sch.id} tidak ditemukan`],
                en: [`Schedule with ID ${sch.id} not found`],
              },
            });
          }
          schedule.service_name = sch.service_name;
          schedule.scheduled_at = sch.scheduled_at;
          await schedule.save({ transaction });
        } else {
          // Create new schedule if no id (though for update, probably all have id)
          schedule = await Schedule.create(
            {
              church_id: church?.id,
              service_name: sch.service_name,
              scheduled_at: sch.scheduled_at,
            },
            { transaction },
          );
        }

        // Delete existing assignments for this schedule
        await ServiceAssignment.destroy({
          where: { schedule_id: schedule.id },
          transaction,
        });

        // Handle instrument assignments if provided
        if (sch.instrument_assignments) {
          for (const instrument_id in sch.instrument_assignments) {
            const member_ids: string[] =
              sch.instrument_assignments[instrument_id];
            for (const member_id of member_ids) {
              await ServiceAssignment.create(
                {
                  schedule_id: schedule.id,
                  member_id,
                  role_id: instrument_id, // assuming instrument_id maps to role_id
                },
                { transaction },
              );
            }
          }
        }
      }

      await transaction?.commit();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Jadwal berhasil diperbarui'],
          en: ['Schedules updated successfully'],
        },
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  async deleteSchedule(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

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

      const schedule = await Schedule.findOne({
        where: { id: Number(id), church_id: church?.id },
      });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Jadwal tidak ditemukan'],
            en: ['Schedule not found'],
          },
        });
      }

      await schedule.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Jadwal berhasil dihapus'],
          en: ['Schedule deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  // ServiceAssignment CRUD with conflict check
  async getServiceAssignments(req: Request, res: Response) {
    try {
      const { church } = req;
      let { page = 1, limit = 10 } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await ServiceAssignment.findAndCountAll({
        offset,
        limit,
        include: [
          {
            model: Schedule,
            as: 'schedule',
            where: { church_id: church?.id },
            required: true,
          },
          { model: Member, as: 'member' },
          { model: Role, as: 'role' },
        ],
        order: [['id', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async createServiceAssignment(req: Request, res: Response) {
    try {
      const { church } = req;
      const { schedule_id, member_id, role_id } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const scheduleIdErrors = validateField(schedule_id, validationRules.id);
      if (scheduleIdErrors.id) errorsId.push(scheduleIdErrors.id);
      if (scheduleIdErrors.en) errorsEn.push(scheduleIdErrors.en);

      const memberIdErrors = validateField(member_id, validationRules.id);
      if (memberIdErrors.id) errorsId.push(memberIdErrors.id);
      if (memberIdErrors.en) errorsEn.push(memberIdErrors.en);

      const roleIdErrors = validateField(role_id, validationRules.id);
      if (roleIdErrors.id) errorsId.push(roleIdErrors.id);
      if (roleIdErrors.en) errorsEn.push(roleIdErrors.en);

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

      // Check if schedule exists
      const schedule = await Schedule.findOne({
        where: { id: schedule_id, church_id: church?.id },
      });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Jadwal tidak ditemukan'],
            en: ['Schedule not found'],
          },
        });
      }

      // Check if member exists
      const member = await Member.findOne({
        where: { id: member_id, church_id: church?.id },
      });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Anggota tidak ditemukan'],
            en: ['Member not found'],
          },
        });
      }

      // Check if role exists
      const role = await Role.findOne({
        where: { id: role_id, church_id: church?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Peran tidak ditemukan'],
            en: ['Role not found'],
          },
        });
      }

      // Check for conflict: member already assigned to another schedule at the same time
      const conflictingAssignment = await ServiceAssignment.findOne({
        include: [
          {
            model: Schedule,
            as: 'schedule',
            where: {
              scheduled_at: schedule.scheduled_at,
              church_id: church?.id,
            },
          },
        ],
        where: {
          member_id,
          schedule_id: { [Op.ne]: schedule_id },
        },
      });

      if (conflictingAssignment) {
        return res.json({
          code: 409,
          status: 'error',
          message: {
            id: [
              'Anggota sudah ditugaskan ke jadwal lain pada waktu yang sama',
            ],
            en: [
              'Member is already assigned to another schedule at the same time',
            ],
          },
        });
      }

      await ServiceAssignment.create({
        schedule_id,
        member_id,
        role_id,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Penugasan layanan berhasil dibuat'],
          en: ['Service assignment created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async updateServiceAssignment(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;
      const { schedule_id, member_id, role_id } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      if (schedule_id !== undefined) {
        const scheduleIdErrors = validateField(schedule_id, validationRules.id);
        if (scheduleIdErrors.id) errorsId.push(scheduleIdErrors.id);
        if (scheduleIdErrors.en) errorsEn.push(scheduleIdErrors.en);
      }

      if (member_id !== undefined) {
        const memberIdErrors = validateField(member_id, validationRules.id);
        if (memberIdErrors.id) errorsId.push(memberIdErrors.id);
        if (memberIdErrors.en) errorsEn.push(memberIdErrors.en);
      }

      if (role_id !== undefined) {
        const roleIdErrors = validateField(role_id, validationRules.id);
        if (roleIdErrors.id) errorsId.push(roleIdErrors.id);
        if (roleIdErrors.en) errorsEn.push(roleIdErrors.en);
      }

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

      const assignment = await ServiceAssignment.findOne({
        where: { id: Number(id) },
      });
      if (!assignment) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Penugasan layanan tidak ditemukan'],
            en: ['Service assignment not found'],
          },
        });
      }

      if (schedule_id) {
        const sch = await Schedule.findOne({
          where: { id: schedule_id, church_id: church?.id },
        });
        if (!sch)
          return res.json({
            code: 404,
            status: 'error',
            message: {
              id: ['Jadwal tidak ditemukan'],
              en: ['Schedule not found'],
            },
          });
        assignment.schedule_id = schedule_id;
      }
      if (member_id) {
        const mem = await Member.findOne({
          where: { id: member_id, church_id: church?.id },
        });
        if (!mem)
          return res.json({
            code: 404,
            status: 'error',
            message: {
              id: ['Anggota tidak ditemukan'],
              en: ['Member not found'],
            },
          });
        assignment.member_id = member_id;
      }
      if (role_id) {
        const rol = await Role.findOne({
          where: { id: role_id, church_id: church?.id },
        });
        if (!rol)
          return res.json({
            code: 404,
            status: 'error',
            message: {
              id: ['Peran tidak ditemukan'],
              en: ['Role not found'],
            },
          });
        assignment.role_id = role_id;
      }

      // If updating member or schedule, check conflict
      if (member_id || schedule_id) {
        const currentSchId = schedule_id || assignment.schedule_id;
        const currentMemberId = member_id || assignment.member_id;
        const sch = await Schedule.findOne({
          where: { id: currentSchId, church_id: church?.id },
        });
        if (!sch) {
          return res.json({
            code: 404,
            status: 'error',
            message: {
              id: ['Jadwal tidak ditemukan'],
              en: ['Schedule not found'],
            },
          });
        }
        const conflicting = await ServiceAssignment.findOne({
          include: [
            {
              model: Schedule,
              as: 'schedule',
              where: { scheduled_at: sch.scheduled_at, church_id: church?.id },
            },
          ],
          where: {
            member_id: currentMemberId,
            schedule_id: { [Op.ne]: currentSchId },
            id: { [Op.ne]: id },
          },
        });
        if (conflicting) {
          return res.json({
            code: 409,
            status: 'error',
            message: {
              id: [
                'Anggota sudah ditugaskan ke jadwal lain pada waktu yang sama',
              ],
              en: [
                'Member is already assigned to another schedule at the same time',
              ],
            },
          });
        }
      }

      await assignment.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Penugasan layanan berhasil diperbarui'],
          en: ['Service assignment updated successfully'],
        },
        data: assignment,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  async deleteServiceAssignment(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

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

      const assignment = await ServiceAssignment.findOne({
        where: { id: Number(id) },
      });
      if (!assignment) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Penugasan layanan tidak ditemukan'],
            en: ['Service assignment not found'],
          },
        });
      }

      await assignment.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Penugasan layanan berhasil dihapus'],
          en: ['Service assignment deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
