import { Request, Response, NextFunction } from "express";
import { register, login, refreshTokenService } from "./auth.service";
import { AppError } from "../../utils/AppError";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await register(req.body.email, req.body.password);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await login(req.body.email, req.body.password);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const tokens = await refreshTokenService(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: tokens
    });

  } catch (error) {
    next(error);
  }
};