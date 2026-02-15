import { Request, Response } from 'express';
import { Member, Role, Schedule, ServiceAssignment } from '../model';
import Validator from 'validatorjs';
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

      const rules = {
        name: 'required|string',
        phone: 'string',
      };

      const validation = new Validator({ name, phone }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            en: ['Validation failed'],
            id: ['Validasi gagal'],
          },
        });

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

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['ID anggota diperlukan dan harus berupa angka'],
            en: ['Member ID is required and must be a number'],
          },
        });

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
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const member = await Member.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Member not found'],
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
        error: err,
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

      const rules = { role_name: 'required|string' };
      const validation = new Validator({ role_name }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

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
        error: err,
      });
    }
  },

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { role_name } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const role = await Role.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Role not found'],
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
        error: err,
      });
    }
  },

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const role = await Role.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Role not found'],
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
        error: err,
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
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const schedule = await Schedule.findOne({
        where: { id: Number(id), user_id: req.user?.id },
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
          message: ['Schedule not found'],
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
        error: err,
      });
    }
  },

  async createSchedule(req: Request, res: Response) {
    let transaction;
    try {
      const { church } = req;
      const { schedules = [] } = req.body;

      const rules = {
        schedules: 'required|array',
        'schedules.*.service_name': 'required|string',
        'schedules.*.scheduled_at': 'required|date',
      };
      const validation = new Validator({ schedules }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: [
              'Validasi gagal',
              'Pastikan semua jadwal memiliki nama dan tanggal yang valid',
            ],
            en: [
              'Validation failed',
              'Ensure all schedules have valid name and date',
            ],
          },
        });

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
            const member_ids: number[] =
              sch.instrument_assignments[instrument_id];
            for (const member_id of member_ids) {
              await ServiceAssignment.create(
                {
                  schedule_id: createdSchedule.id,
                  member_id,
                  role_id: Number(instrument_id), // assuming instrument_id maps to role_id
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

      const rules = {
        schedules: 'required|array',
        'schedules.*.service_name': 'required|string',
        'schedules.*.scheduled_at': 'required|date',
      };
      const validation = new Validator({ schedules }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: [
              'Validasi gagal',
              'Pastikan semua jadwal memiliki nama dan tanggal yang valid',
            ],
            en: [
              'Validation failed',
              'Ensure all schedules have valid name and date',
            ],
          },
        });

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
            const member_ids: number[] =
              sch.instrument_assignments[instrument_id];
            for (const member_id of member_ids) {
              await ServiceAssignment.create(
                {
                  schedule_id: schedule.id,
                  member_id,
                  role_id: Number(instrument_id), // assuming instrument_id maps to role_id
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
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const schedule = await Schedule.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Schedule not found'],
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
        error: err,
      });
    }
  },

  // ServiceAssignment CRUD with conflict check
  async getServiceAssignments(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10 } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await ServiceAssignment.findAndCountAll({
        offset,
        limit,
        where: { user_id: req.user?.id },
        include: [
          { model: Schedule, as: 'schedule' },
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
        error: err,
      });
    }
  },

  async createServiceAssignment(req: Request, res: Response) {
    try {
      const { schedule_id, member_id, role_id } = req.body;

      const rules = {
        schedule_id: 'required|numeric',
        member_id: 'required|numeric',
        role_id: 'required|numeric',
      };

      const validation = new Validator(
        { schedule_id, member_id, role_id },
        rules,
      );
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      // Check if schedule exists
      const schedule = await Schedule.findOne({
        where: { id: schedule_id, user_id: req.user?.id },
      });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Schedule not found'],
        });
      }

      // Check if member exists
      const member = await Member.findOne({
        where: { id: member_id, user_id: req.user?.id },
      });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Member not found'],
        });
      }

      // Check if role exists
      const role = await Role.findOne({
        where: { id: role_id, user_id: req.user?.id },
      });
      if (!role) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Role not found'],
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
              user_id: req.user?.id, // Add user_id filter to schedule
            },
          },
        ],
        where: {
          member_id,
          user_id: req.user?.id, // Add user_id filter
          schedule_id: { [Op.ne]: schedule_id },
        },
      });

      if (conflictingAssignment) {
        return res.json({
          code: 409,
          status: 'error',
          message: [
            'Member is already assigned to another schedule at the same time',
          ],
        });
      }

      await ServiceAssignment.create({
        user_id: req.user?.id,
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
        error: err,
      });
    }
  },

  async updateServiceAssignment(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { schedule_id, member_id, role_id } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const assignment = await ServiceAssignment.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!assignment) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Service assignment not found'],
        });
      }

      if (schedule_id) {
        const sch = await Schedule.findOne({
          where: { id: schedule_id, user_id: req.user?.id },
        });
        if (!sch)
          return res.json({
            code: 404,
            status: 'error',
            message: ['Schedule not found'],
          });
        assignment.schedule_id = schedule_id;
      }
      if (member_id) {
        const mem = await Member.findOne({
          where: { id: member_id, user_id: req.user?.id },
        });
        if (!mem)
          return res.json({
            code: 404,
            status: 'error',
            message: ['Member not found'],
          });
        assignment.member_id = member_id;
      }
      if (role_id) {
        const rol = await Role.findOne({
          where: { id: role_id, user_id: req.user?.id },
        });
        if (!rol)
          return res.json({
            code: 404,
            status: 'error',
            message: ['Role not found'],
          });
        assignment.role_id = role_id;
      }

      // If updating member or schedule, check conflict
      if (member_id || schedule_id) {
        const currentSchId = schedule_id || assignment.schedule_id;
        const currentMemberId = member_id || assignment.member_id;
        const sch = await Schedule.findOne({
          where: { id: currentSchId, user_id: req.user?.id },
        });
        if (!sch) {
          return res.json({
            code: 404,
            status: 'error',
            message: ['Schedule not found'],
          });
        }
        const conflicting = await ServiceAssignment.findOne({
          include: [
            {
              model: Schedule,
              as: 'schedule',
              where: { scheduled_at: sch.scheduled_at, user_id: req.user?.id },
            },
          ],
          where: {
            member_id: currentMemberId,
            user_id: req.user?.id,
            schedule_id: { [Op.ne]: currentSchId },
            id: { [Op.ne]: id },
          },
        });
        if (conflicting) {
          return res.json({
            code: 409,
            status: 'error',
            message: [
              'Member is already assigned to another schedule at the same time',
            ],
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
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const assignment = await ServiceAssignment.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!assignment) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Service assignment not found'],
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
        error: err,
      });
    }
  },
};
