import { calculateNextRun } from '../helpers';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Automation, AutomationLog, Congregation } from '../model';
import sequelize from '../../config/db.config';
import { DateTime } from 'luxon';

export const AutomationController = {
  async processDueAutomations(req: Request, res: Response) {
    let transaction = await sequelize.transaction();
    try {
      const dueAutomations = await Automation.findAll({
        where: {
          is_active: true,
          next_run_at: {
            [Op.lte]: new Date(),
          },
        },
        limit: 200,
        order: [['next_run_at', 'ASC']],
        lock: transaction.LOCK.UPDATE,
        skipLocked: true,
        transaction,
      });

      for (const automation of dueAutomations) {
        if (automation.type === 'birthday_greeting') {
          // 1️⃣ find congregation members whose birthday is today in automation's timezone
          const tz = automation.timezone || 'UTC';
          const nowLocal = DateTime.utc().setZone(tz);
          const monthDay = nowLocal.toFormat('MM-dd');

          const recipients = await Congregation.findAll({
            where: {
              [Op.and]: [
                { church_id: automation.church_id },
                sequelize.where(
                  sequelize.fn('to_char', sequelize.col('birth_date'), 'MM-DD'),
                  monthDay,
                ),
              ],
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
            skipLocked: true,
          });

          // create pending AutomationLog entries for each recipient
          for (const r of recipients) {
            await AutomationLog.create(
              {
                automation_id: automation.id,
                church_id: automation.church_id,
                recipient_phone:
                  (r as any).phone_number || (r as any).phone || '',
                status: 'pending',
                message: automation.config?.message || null,
              },
              { transaction },
            );
          }

          // 2️⃣ Update last_run_at
          automation.last_run_at = new Date();

          // 3️⃣ Recalculate next_run_at
          automation.next_run_at = calculateNextRun(
            automation.send_time_local!,
            automation.timezone,
          );

          await automation.save({ transaction });
        }
      }
      await transaction.commit();
      res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Automasi berhasil diproses'],
          en: ['Automations processed successfully'],
        },
      });
    } catch (error) {
      await transaction.rollback();
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async createOrUpdateBirthdayGreeting(req: Request, res: Response) {
    try {
      const { church } = req;
      const { message, send_time_local, timezone } = req.body;

      let automation = await Automation.findOne({
        where: { church_id: church?.id, type: 'birthday_greeting' },
        order: [['created_at', 'DESC']],
      });

      if (!automation) {
        automation = await Automation.create({
          church_id: church?.id!,
          type: 'birthday_greeting',
          config: { message },
          send_time_local,
          timezone,
          is_active: true,
          next_run_at: calculateNextRun(send_time_local, timezone),
        });
      } else {
        automation.config = { message };
        automation.send_time_local = send_time_local;
        automation.timezone = timezone;
        automation.next_run_at = calculateNextRun(send_time_local, timezone);
        await automation.save();
      }

      res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Automasi ucapan ulang tahun berhasil disimpan'],
          en: ['Birthday greeting automation saved successfully'],
        },
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  async getBirthDayGreeting(req: Request, res: Response) {
    try {
      const { church } = req;
      const automations = await Automation.findOne({
        where: { church_id: church?.id, type: 'birthday_greeting' },
        order: [['created_at', 'DESC']],
      });
      if (!automations) {
        return res.json({
          code: 200,
          status: 'success',
          message: {
            id: ['Automasi ucapan ulang tahun tidak ditemukan'],
            en: ['Birthday greeting automation not found'],
          },
          data: [],
        });
      }
      res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Automasi berhasil diambil'],
          en: ['Automations retrieved successfully'],
        },
        data: [automations],
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
