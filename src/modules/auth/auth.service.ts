import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "./auth.repository";
import { AppError } from "../../utils/AppError";
import { env } from "../../config/env";
import { updateFailedAttempts, resetAttempts } from "./auth.repository";
import { pool } from "../../config/db";

export const register = async (email: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError("User already exists", 400);

  const hashed = await bcrypt.hash(password, 10);

  const user = await createUser(email, hashed);

  return user;
};


const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 min
export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  // 🔒 Check if account is locked
  if (user.lock_until && user.lock_until > Date.now()) {
    throw new AppError("Account locked. Try after some time.", 403);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const attempts = (user.failed_attempts || 0) + 1;

    // 🔐 Lock account
    if (attempts >= MAX_ATTEMPTS) {
      await updateFailedAttempts(
        user.id,
        attempts,
        Date.now() + LOCK_TIME
      );
    } else {
      await updateFailedAttempts(user.id, attempts, 0);
    }

    throw new AppError("Invalid credentials", 401);
  }

  // ✅ Success → reset attempts
  await resetAttempts(user.id);

  return generateTokens(user.id);
};
export const generateTokens = async (userId: number) => {
  try {
    // 🔐 Access Token (short-lived)
    const accessToken = jwt.sign(
      { id: userId },
      env.jwtSecret,
      { expiresIn: "15m" }
    );

    // 🔄 Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { id: userId },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    // 🗄️ Store refresh token in DB
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [
        userId,
        refreshToken,
        Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      ]
    );

    return { accessToken, refreshToken };

  } catch (error) {
    throw new AppError("Token generation failed", 500);
  }
};

export const refreshTokenService = async (token: string) => {
  if (!token) throw new AppError("Refresh token required", 401);

  const decoded: any = jwt.verify(token, env.jwtSecret);

  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token=$1",
    [token]
  );

  if (!result.rows.length) {
    throw new AppError("Invalid refresh token", 401);
  }

  return generateTokens(decoded.id);
};