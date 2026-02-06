import { Request, Response } from 'express';
import { Family, Jemaat, Event } from '../model';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/db.config';

export const DashboardController = {
  async dashboard(req: Request, res: Response) {
    try {
      // Count total members
      let { user } = req;
      const totalMembers = await Jemaat.count({ where: { user_id: user?.id } });

      // Count total families
      const totalFamilies = await Family.count({
        where: { user_id: user?.id },
      });

      // Count male members
      const totalMale = await Jemaat.count({
        where: { gender: 'male', user_id: user?.id },
      });

      // Count female members
      const totalFemale = await Jemaat.count({
        where: { gender: 'female', user_id: user?.id },
      });

      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      // Calculate income this month
      const incomeResult = await sequelize.query(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.type = 'income' AND t.user_id = ? AND EXTRACT(YEAR FROM t.date) = ? AND EXTRACT(MONTH FROM t.date) = ?`,
        {
          replacements: [user?.id, currentYear, currentMonth],
          type: QueryTypes.SELECT,
        },
      );
      const incomeThisMonth = (incomeResult[0] as any).total || 0;

      // Calculate expense this month
      const expenseResult = await sequelize.query(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.type = 'expense' AND t.user_id = ? AND EXTRACT(YEAR FROM t.date) = ? AND EXTRACT(MONTH FROM t.date) = ?`,
        {
          replacements: [user?.id, currentYear, currentMonth],
          type: QueryTypes.SELECT,
        },
      );
      const expenseThisMonth = (expenseResult[0] as any).total || 0;

      // Get events this month
      const eventsThisMonth = await sequelize.query(
        `SELECT id, title, start, "end", description FROM events WHERE user_id = ? AND EXTRACT(YEAR FROM start) = ? AND EXTRACT(MONTH FROM start) = ? ORDER BY start ASC`,
        {
          replacements: [user?.id, currentYear, currentMonth],
          type: QueryTypes.SELECT,
        },
      );

      // Get birthdays this month
      const birthdaysThisMonth = await sequelize.query(
        `SELECT id, name, birth_date, ${currentYear} - EXTRACT(YEAR FROM birth_date) as age FROM jemaat WHERE user_id = ? AND EXTRACT(MONTH FROM birth_date) = ? ORDER BY birth_date ASC`,
        {
          replacements: [user?.id, currentMonth],
          type: QueryTypes.SELECT,
        },
      );

      // Return the data
      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Data dashboard berhasil diambil'],
          en: ['Dashboard data retrieved successfully'],
        },
        data: {
          totalMembers,
          totalFamilies,
          totalMale,
          totalFemale,
          incomeThisMonth,
          expenseThisMonth,
          eventsThisMonth,
          birthdaysThisMonth,
        },
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
