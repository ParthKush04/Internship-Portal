import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.token;
    const token = cookieToken || bearerToken;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = {
      ...user.toObject(),
      role: user.role
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });
      res.status(401);
      error.message = "Token expired, please login again";
      error.status = 401;
      next(error);
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401);
      error.message = "Invalid token";
      error.status = 401;
      next(error);
      return;
    }

    if (res.statusCode === 200) {
      res.status(401);
    }
    if (!error.status && res.statusCode) {
      error.status = res.statusCode;
    }
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Forbidden: insufficient role");
  }
  next();
};

export { protect, authorize };
