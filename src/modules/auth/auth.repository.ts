import { pool } from "../../config/db";
export const createUser = async (email: string, password: string) => {
  const result = await pool.query(
    `INSERT INTO users (email, password, failed_attempts, lock_until) 
     VALUES ($1, $2, 0, 0) RETURNING *`,
    [email, password]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

export const updateFailedAttempts = async (userId: number, attempts: number, lockUntil: number) => {
  await pool.query(
    "UPDATE users SET failed_attempts=$1, lock_until=$2 WHERE id=$3",
    [attempts, lockUntil, userId]
  );
};

export const resetAttempts = async (userId: number) => {
  await pool.query(
    "UPDATE users SET failed_attempts=0, lock_until=0 WHERE id=$1",
    [userId]
  );
};