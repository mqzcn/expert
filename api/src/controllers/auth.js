import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
} from "../utils/email.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isActive: false,
  });

  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });
  console.log({ user });
  if (!user) {
    console.log({ nouser: true });
    res.status(403);
    throw new Error("Invalid email or password");
  }
  console.log({ password });
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(403);
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // To prevent email enumeration, send a generic success response
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email (pass unhashed token)
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still send a generic success message to the client for security
      // but log the internal error
      user.passwordResetToken = undefined; // Rollback token fields if email fails
      user.passwordResetExpires = undefined;
      await user.save(); // Attempt to save the rollback

      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent (internal error occurred).",
      });
    }
  } catch (error) {
    console.error("Forgot password controller error:", error);
    // Generic error for other unexpected issues
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error("Token and password are required.");
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired password reset token.");
    }

    user.password = password; // Pre-save hook will hash
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email (non-blocking)
    sendPasswordChangeConfirmationEmail(user.email, user.name).catch((err) =>
      console.error("Failed to send password change confirmation email:", err)
    );

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password controller error:", error.message);
    // If it's one of our thrown errors, use its message, otherwise generic
    if (res.statusCode === 400) {
      res.json({ message: error.message }); // Error already set by throw
    } else {
      res
        .status(500)
        .json({
          message:
            "An internal server error occurred while resetting password.",
        });
    }
  }
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // Basic email update. Consider adding email uniqueness check for other users later.
    if (req.body.email && req.body.email !== user.email) {
      // Optional: Check if new email is already taken by another user
      // const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
      // if (emailExists) {
      //   res.status(400);
      //   throw new Error('Email already in use by another account.');
      // }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      // Do not send token here unless it's re-issued
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401); // Unauthorized or 400 Bad Request
    throw new Error("Incorrect current password.");
  }

  user.password = newPassword; // Pre-save hook will hash
  await user.save();

  // Optional: Send password change confirmation email here (deferred for this task)
  // sendPasswordChangeConfirmationEmail(user.email, user.name).catch(err => console.error('Failed to send password change confirmation email:', err));

  res.status(200).json({ message: "Password updated successfully." });
});

export const setUserAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  // Validate isAvailable input
  if (typeof isAvailable !== "boolean") {
    res.status(400);
    throw new Error("Invalid 'isAvailable' value. It must be true or false.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.role !== "interpreter") {
    res.status(403);
    throw new Error("User is not an interpreter. Cannot set availability.");
  }

  user.isAvailable = isAvailable;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name, // Included for context, can be removed
    isAvailable: user.isAvailable,
  });
});
