import { Request, Response } from 'express';
import { Jemaat, User, Church } from '../model';
import Validator from 'validatorjs';
import { Op, fn } from 'sequelize';
import sequelize from '../../config/db.config';

export const JemaatController = {
  async getAll(req: Request, res: Response) {
    try {
      let {
        page = 1,
        limit = 10,
        id,
        q,
        family_id,
        exclude_id,
        gender,
      } = req.query;

      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;
      const birth_date_start = req.query.birth_date_start
        ? new Date(String(req.query.birth_date_start))
        : null;
      const birth_date_end = req.query.birth_date_end
        ? new Date(String(req.query.birth_date_end))
        : null;

      const dad = req.query.dad === 'true' ? true : false;
      const mom = req.query.dad === 'true' ? true : false;
      const children = req.query.children === 'true' ? true : false;

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

      let whereClause: any = { church_id: church.id }; // Add church filter
      let includeClause: any[] = [];

      if (gender) {
        whereClause = {
          ...whereClause,
          gender: String(gender),
        };
      }

      if (exclude_id) {
        whereClause = {
          ...whereClause,
          id: { [Op.not]: Number(exclude_id) },
        };
      }

      if (birth_date_start && birth_date_end) {
        whereClause = {
          ...whereClause,
          birth_date: { [Op.between]: [birth_date_start, birth_date_end] },
        };
      }

      if (q) {
        whereClause = {
          ...whereClause,
          name: { [Op.iLike]: `%${q}%` },
        };
      }

      if (id) {
        whereClause = {
          ...whereClause,
          id: Number(id),
        };
      }

      if (family_id) {
        whereClause = { ...whereClause, family_id: Number(family_id) };
      }

      if (dad) {
        includeClause.push({
          model: Jemaat,
          as: 'dad',
        });
      }

      if (mom) {
        includeClause.push({
          model: Jemaat,
          as: 'mom',
        });
      }

      if (children) {
        includeClause.push({
          model: Jemaat,
          as: 'children',
          where: {
            [Op.or]: [
              { mom_id: { [Op.col]: 'Jemaat.id' } },
              { dad_id: { [Op.col]: 'Jemaat.id' } },
            ],
          },
          required: false,
        });
      }

      const { count, rows } = await Jemaat.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        include: includeClause,
        attributes: [
          ...Object.keys(Jemaat.rawAttributes),
          [
            fn('EXTRACT', sequelize.literal('YEAR FROM AGE(birth_date)')),
            'age',
          ],
        ],
        order: [['id', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Data Jemaat berhasil diambil'],
          en: ['Congregation data retrieved successfully'],
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
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
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
          message: {
            id: ['Permintaan tidak valid'],
            en: ['Invalid request'],
          },
        });

      const {
        name,
        birth_date,
        born_place,
        baptism_date,
        is_married,
        mom_id,
        dad_id,
        phone_number,
        family_id,
        gender,
      } = req.body;

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

      const jemaat = await Jemaat.findOne({
        where: { id, church_id: church.id },
      });

      if (!jemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Jemaat tidak ditemukan'],
            en: ['Congregation not found'],
          },
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
      if (typeof phone_number !== 'undefined')
        jemaat.phone_number = phone_number;
      if (typeof family_id !== 'undefined') jemaat.family_id = family_id;
      if (typeof gender !== 'undefined') jemaat.gender = gender;

      await jemaat.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Jemaat berhasil diperbarui'],
          en: ['Congregation updated successfully'],
        },
        data: jemaat,
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
  async createJemaat(req: Request, res: Response) {
    let transaction;
    const { user, church } = req;
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
        gender,
      } = req.body;

      const rules = {
        name: 'required|string',
        birth_date: 'required|date',
        born_place: 'required|string',
        gender: 'required|in:male,female',
      };

      const validation = new Validator(
        { name, birth_date, born_place, gender },
        rules,
      );
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Permintaan tidak valid'],
            en: ['Invalid request'],
          },
        });

      transaction = await sequelize.transaction();
      await Jemaat.create(
        {
          name,
          birth_date,
          born_place,
          baptism_date: baptism_date || null,
          is_married,
          mom_id: mom_id || null,
          dad_id: dad_id || null,
          phone_number: phone_number || null,
          gender: gender || 'male',
          church_id: church?.id, // Add church_id
        },
        { transaction },
      );

      // Increment total_jemaat_created for the user
      await User.increment('total_jemaat_created', {
        where: { id: req.user?.id },
        transaction,
      });

      await transaction.commit();

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Jemaat berhasil dibuat'],
          en: ['Congregation created successfully'],
        },
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
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
  async deleteJemaat(req: Request, res: Response) {
    let transaction;
    try {
      const { user } = req;
      const { id } = req.query;

      const rules = {
        id: 'required|numeric',
      };

      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Permintaan tidak valid'],
            en: ['Invalid request'],
          },
        });

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: user?.id } });
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

      const jemaat = await Jemaat.findOne({
        where: { id, church_id: church.id },
      });

      if (!jemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Jemaat tidak ditemukan'],
            en: ['Congregation not found'],
          },
        });
      }
      transaction = await sequelize.transaction();
      await jemaat.destroy({ transaction });

      await User.decrement('total_jemaat_created', {
        where: { id: user?.id },
        transaction,
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Jemaat berhasil dihapus'],
          en: ['Congregation deleted successfully'],
        },
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
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
  async getChildren(req: Request, res: Response) {
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
          message: {
            id: ['Permintaan tidak valid'],
            en: ['Invalid request'],
          },
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

      // Check if parent jemaat exists and belongs to current church
      const parentJemaat = await Jemaat.findOne({
        where: { id: Number(id), church_id: church.id },
      });

      if (!parentJemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Orang tua jemaat tidak ditemukan'],
            en: ['Parent Congregation not found'],
          },
        });
      }

      // Get all children (mom_id or dad_id equals to parent id)
      const children = await Jemaat.findAll({
        where: {
          [Op.or]: [{ mom_id: Number(id) }, { dad_id: Number(id) }],
          user_id: req.user?.id, // Ensure children belong to same user
        },
        attributes: [
          ...Object.keys(Jemaat.rawAttributes),
          [
            fn('EXTRACT', sequelize.literal('YEAR FROM AGE(birth_date)')),
            'age',
          ],
        ],
        order: [['birth_date', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Data Anak berhasil diambil'],
          en: ['Children retrieved successfully'],
        },
        data: children,
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
  async getBirthdayByMonth(req: Request, res: Response) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Tanggal diperlukan'],
            en: ['Date is required'],
          },
        });
      }

      const parsedDate = new Date(String(date));
      if (isNaN(parsedDate.getTime())) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Format tanggal tidak valid'],
            en: ['Invalid date format'],
          },
        });
      }

      const month = parsedDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

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

      const jemaats = await Jemaat.findAll({
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn(
                'EXTRACT',
                sequelize.literal('MONTH FROM birth_date'),
              ),
              month,
            ),
            { church_id: church.id },
          ],
        },
        attributes: [
          ...Object.keys(Jemaat.rawAttributes),
          [
            fn('EXTRACT', sequelize.literal('YEAR FROM AGE(birth_date)')),
            'age',
          ],
        ],
        order: [['birth_date', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: jemaats,
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
