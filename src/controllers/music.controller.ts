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
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (q) {
        whereClause = { name: { [Op.iLike]: `%${q}%` } };
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
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  async createMember(req: Request, res: Response) {
    try {
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
          message: validation.errors.all(),
        });

      await Member.create({ name, phone });

      return res.json({
        code: 201,
        status: 'success',
        message: ['Member created successfully'],
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

  async updateMember(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { name, phone } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const member = await Member.findOne({ where: { id: Number(id) } });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Member not found'],
        });
      }

      if (name) member.name = name;
      if (phone !== undefined) member.phone = phone;
      await member.save();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Member updated successfully'],
        data: member,
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

      const member = await Member.findOne({ where: { id: Number(id) } });
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
        message: ['Member deleted successfully'],
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

  // Role CRUD
  async getRoles(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (q) {
        whereClause = { role_name: { [Op.iLike]: `%${q}%` } };
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
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  async createRole(req: Request, res: Response) {
    try {
      const { role_name } = req.body;

      const rules = { role_name: 'required|string' };
      const validation = new Validator({ role_name }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      await Role.create({ role_name });

      return res.json({
        code: 201,
        status: 'success',
        message: ['Role created successfully'],
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

      const role = await Role.findOne({ where: { id: Number(id) } });
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
        message: ['Role updated successfully'],
        data: role,
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

      const role = await Role.findOne({ where: { id: Number(id) } });
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
        message: ['Role deleted successfully'],
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

  // Schedule CRUD
  async getSchedules(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      const musician = req.query.musician === 'true';

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
      let whereClause = {};
      if (q) {
        whereClause = { service_name: { [Op.iLike]: `%${q}%` } };
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
      console.log(err, '??');

      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  async createSchedule(req: Request, res: Response) {
    let transaction;
    try {
      console.log(req.body, '???');

      const { schedules = [] } = req.body;
      console.log(JSON.stringify(schedules), '?as');

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
          message: validation.errors.all(),
        });

      transaction = await Schedule.sequelize?.transaction();

      for (const sch of schedules) {
        let createdSchedule = await Schedule.create(
          {
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
        message: ['Schedules created successfully'],
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { service_name, scheduled_at } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const schedule = await Schedule.findOne({ where: { id: Number(id) } });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Schedule not found'],
        });
      }

      if (service_name) schedule.service_name = service_name;
      if (scheduled_at) schedule.scheduled_at = scheduled_at;
      await schedule.save();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Schedule updated successfully'],
        data: schedule,
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

      const schedule = await Schedule.findOne({ where: { id: Number(id) } });
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
        message: ['Schedule deleted successfully'],
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
        message: ['Internal server error'],
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
      const schedule = await Schedule.findOne({ where: { id: schedule_id } });
      if (!schedule) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Schedule not found'],
        });
      }

      // Check if member exists
      const member = await Member.findOne({ where: { id: member_id } });
      if (!member) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Member not found'],
        });
      }

      // Check if role exists
      const role = await Role.findOne({ where: { id: role_id } });
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
          message: [
            'Member is already assigned to another schedule at the same time',
          ],
        });
      }

      await ServiceAssignment.create({ schedule_id, member_id, role_id });

      return res.json({
        code: 201,
        status: 'success',
        message: ['Service assignment created successfully'],
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
        where: { id: Number(id) },
      });
      if (!assignment) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Service assignment not found'],
        });
      }

      if (schedule_id) {
        const sch = await Schedule.findOne({ where: { id: schedule_id } });
        if (!sch)
          return res.json({
            code: 404,
            status: 'error',
            message: ['Schedule not found'],
          });
        assignment.schedule_id = schedule_id;
      }
      if (member_id) {
        const mem = await Member.findOne({ where: { id: member_id } });
        if (!mem)
          return res.json({
            code: 404,
            status: 'error',
            message: ['Member not found'],
          });
        assignment.member_id = member_id;
      }
      if (role_id) {
        const rol = await Role.findOne({ where: { id: role_id } });
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
        const sch = await Schedule.findOne({ where: { id: currentSchId } });
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
              where: { scheduled_at: sch.scheduled_at },
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
        message: ['Service assignment updated successfully'],
        data: assignment,
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
        where: { id: Number(id) },
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
        message: ['Service assignment deleted successfully'],
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
