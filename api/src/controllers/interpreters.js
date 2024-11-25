import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const getInterpreterProfile = asyncHandler(async (req, res) => {
  const interpreter = await User.findById(req.user._id).populate(
    "languages",
    "name code"
  );

  if (!interpreter) {
    res.status(404);
    throw new Error("Interpreter not found");
  }

  res.json(interpreter);
});

export const updateInterpreterLanguages = asyncHandler(async (req, res) => {
  const { languages } = req.body;

  if (!Array.isArray(languages)) {
    res.status(400);
    throw new Error("Languages must be an array");
  }

  const interpreter = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { languages } },
    { new: true }
  ).populate("languages", "name code");

  if (!interpreter) {
    res.status(404);
    throw new Error("Interpreter not found");
  }

  res.json(interpreter);
});

export const getInterpreters = asyncHandler(async (req, res) => {
  const interpreters = await User.find({ role: "interpreter" }).populate(
    "languages",
    "name code"
  );
  res.json(interpreters);
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  const interpreter = await User.findByIdAndUpdate(
    req.user._id,
    { availability },
    { new: true }
  );

  if (!interpreter) {
    res.status(404);
    throw new Error("Interpreter not found");
  }

  res.json(interpreter);
});
