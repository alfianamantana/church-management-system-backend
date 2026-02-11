import { Request, Response } from 'express';
import { Asset, Church } from '../model';
import { Op } from 'sequelize';

export const getAssets = async (req: Request, res: Response) => {
  try {
    let { page = 1, limit = 10, q } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const offset = (page - 1) * limit;

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

    let whereClause: any = {
      church_id: church.id,
    };
    if (q) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { category: { [Op.iLike]: `%${q}%` } },
          { location: { [Op.iLike]: `%${q}%` } },
        ],
      };
    }

    const { count, rows } = await Asset.findAndCountAll({
      offset,
      limit,
      where: whereClause,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    res.json({
      code: 200,
      status: 'success',
      data: rows,
      message: {
        id: ['Data Aset berhasil diambil'],
        en: ['Assets retrieved successfully'],
      },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.json({
      code: 500,
      status: 'error',
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
    });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      value,
      acquisition_date,
      condition,
      location,
      category,
      notes,
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

    const asset = await Asset.create({
      church_id: church.id,
      name,
      description,
      value,
      acquisition_date,
      condition,
      location,
      category,
      notes,
    });

    res.json({
      code: 201,
      message: {
        id: ['Aset berhasil dibuat'],
        en: ['Asset created successfully'],
      },
      data: asset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.json({
      code: 500,
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
    });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id);
    const {
      name,
      description,
      value,
      acquisition_date,
      condition,
      location,
      category,
      notes,
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

    const asset = await Asset.findByPk(id);

    if (!asset || asset.church_id !== church.id) {
      return res.json({
        code: 404,
        message: {
          id: ['Aset tidak ditemukan'],
          en: ['Asset not found'],
        },
      });
    }

    await asset.update({
      name,
      description,
      value,
      acquisition_date,
      condition,
      location,
      category,
      notes,
    });

    res.json({
      code: 200,
      message: {
        id: ['Aset berhasil diperbarui'],
        en: ['Asset updated successfully'],
      },
      data: asset,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
    });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id);

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

    const asset = await Asset.findByPk(id);

    if (!asset || asset.church_id !== church.id) {
      return res.json({
        code: 404,
        message: {
          id: ['Aset tidak ditemukan'],
          en: ['Asset not found'],
        },
      });
    }

    await asset.destroy();

    res.json({
      code: 200,
      message: {
        id: ['Aset berhasil dihapus'],
        en: ['Asset deleted successfully'],
      },
    });
  } catch (error) {
    res.json({
      code: 500,
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
    });
  }
};
