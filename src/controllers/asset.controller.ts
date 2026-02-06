import { Request, Response } from 'express';
import { Asset } from '../model';
import { Op } from 'sequelize';

export const getAssets = async (req: Request, res: Response) => {
  try {
    let { page = 1, limit = 10, q } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (q) {
      whereClause = {
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
      message: ['Internal server error'],
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

    const asset = await Asset.create({
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
      message: ['Asset created successfully'],
      data: asset,
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.json({
      code: 500,
      message: ['Internal server error'],
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

    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        code: 404,
        message: ['Asset not found'],
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
      message: ['Asset updated successfully'],
      data: asset,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: ['Internal server error'],
    });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id);
    const asset = await Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        code: 404,
        message: ['Asset not found'],
      });
    }

    await asset.destroy();

    res.json({
      code: 200,
      message: ['Asset deleted successfully'],
    });
  } catch (error) {
    res.json({
      code: 500,
      message: ['Internal server error'],
    });
  }
};
