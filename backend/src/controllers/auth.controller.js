import argon2 from "argon2";
import pool from "../db.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { z } from "zod";

export const register = async (req, res) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: z.treeifyError(validation.error),
    });
  }

  const { email, password, displayName } = validation.data;

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const result = await pool.query(
      `
        INSERT INTO users (email, password_hash, display_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, display_name
      `,
      [email, passwordHash, displayName],
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid input data",
    });
  }

  const { email, password } = validation.data;

  try {
    const result = await pool.query(
      `
        SELECT id, email, display_name, password_hash
        FROM users
        WHERE email = $1
      `,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error);

        return res.status(500).json({
          message: "Internal server error",
        });
      }

      req.session.userId = user.id;

      req.session.save((error) => {
        if (error) {
          console.error("Session save error:", error);

          return res.status(500).json({
            message: "Internal server error",
          });
        }

        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
          },
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, email, display_name
        FROM users
        WHERE id = $1
      `,
      [req.session.userId],
    );

    const user = result.rows[0];

    if (!user) {
      return req.session.destroy((error) => {
        if (error) {
          console.error("Session destroy error:", error);

          return res.status(500).json({
            message: "Internal server error",
          });
        }

        res.clearCookie("dreamgift.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });

        return res.status(401).json({
          message: "Unauthorized",
        });
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }

    res.clearCookie("dreamgift.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  });
};
