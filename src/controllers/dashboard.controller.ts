import { Request, Response } from 'express';
import { Family, Jemaat, Event } from '../model';
import { QueryTypes, literal } from 'sequelize';
import sequelize from '../../config/db.config';

export const DashboardController = {
  async dashboard(req: Request, res: Response) {
    try {
      // Count total members
      const totalMembers = await Jemaat.count();

      // Count total families
      const totalFamilies = await Family.count();

      // Count male members
      const totalMale = await Jemaat.count({ where: { gender: 'male' } });

      // Count female members
      const totalFemale = await Jemaat.count({ where: { gender: 'female' } });

      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      // Calculate income this month
      const incomeResult = await sequelize.query(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.type = 'income' AND EXTRACT(YEAR FROM t.date) = ? AND EXTRACT(MONTH FROM t.date) = ?`,
        {
          replacements: [currentYear, currentMonth],
          type: QueryTypes.SELECT,
        },
      );
      const incomeThisMonth = (incomeResult[0] as any).total || 0;

      // Calculate expense this month
      const expenseResult = await sequelize.query(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.type = 'expense' AND EXTRACT(YEAR FROM t.date) = ? AND EXTRACT(MONTH FROM t.date) = ?`,
        {
          replacements: [currentYear, currentMonth],
          type: QueryTypes.SELECT,
        },
      );
      const expenseThisMonth = (expenseResult[0] as any).total || 0;

      // Get events this month
      const eventsThisMonth = await Event.findAll({
        where: literal(
          `EXTRACT(YEAR FROM start) = ${currentYear} AND EXTRACT(MONTH FROM start) = ${currentMonth}`,
        ),
        attributes: ['id', 'title', 'start', 'end', 'description'],
        order: [['start', 'ASC']],
      });

      // Get birthdays this month
      const birthdaysThisMonth = await Jemaat.findAll({
        where: literal(`EXTRACT(MONTH FROM birth_date) = ${currentMonth}`),
        attributes: ['id', 'name', 'birth_date'],
        order: [['birth_date', 'ASC']],
      });

      // Return the data
      return res.json({
        code: 200,
        status: 'success',
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
      console.log(error, 'asdasd?');

      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
      });
    }
  },
};
