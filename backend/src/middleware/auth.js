import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      const publicPaths = ["/api/auth/login", "/api/auth/register"];
      if (!user.isActive && !publicPaths.includes(req.path)) {
        res.status(403);
        throw new Error(
          "Account is not active. Please contact admin for activation."
        );
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401);
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else if (error.name === "TokenExpiredError") {
        throw new Error("Token expired");
      } else {
        throw new Error("Not authorized");
      }
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

export const interpreter = (req, res, next) => {
  if (req.user && req.user.role === "interpreter") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as interpreter");
  }
};
