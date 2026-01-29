

import { Request, Response } from "express";
import Validator from 'validatorjs';
import { User, Auth } from '../model';
import bcrypt from "bcrypt";
import { generateToken } from "../helpers";

exports.login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const rules = { email: 'required|email', password: 'required|string' };
    const validation = new Validator({ email, password }, rules);
    if (validation.fails()) return res.json({ code: 400, status: "error", message: validation.errors.all() });

    const userInstance = await User.findOne({ where: { email } });

    if (!userInstance) return res.json({ code: 400, status: "error", message: "Invalid credentials" });

    const match = await bcrypt.compare(password, userInstance.password);

    if (!match) return res.json({ code: 400, status: 'error', message: 'Invalid credentials' });

    const token = generateToken(25);
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Upsert user token: if an Auth exists for this user, update it; otherwise create.
    const existingInstance = await Auth.findOne({ where: { userId: userInstance.id } });
    if (existingInstance) {
      await existingInstance.update({ token, validUntil });
    } else {
      await Auth.create({ userId: userInstance.id, token, validUntil });
    }

    const { password: _, ...userData } = userInstance.get({ plain: true });

    return res.json({ code: 200, status: "success", message: "Login successful", token: token, data: userData });
  } catch (err) {
    return res.json({ code: 500, status: "error", message: 'Server error' });
  }
};