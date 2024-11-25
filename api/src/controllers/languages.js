import asyncHandler from "express-async-handler";
import Language from "../models/Language.js";
import User from "../models/User.js";

export const getLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.find({}).sort({ name: 1 });
  res.json(languages);
});

export const addLanguage = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  const languageExists = await Language.findOne({ code });
  if (languageExists) {
    res.status(400);
    throw new Error("Language already exists");
  }

  const language = await Language.create({
    name,
    code,
  });

  res.status(201).json(language);
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findById(req.params.id);

  if (!language) {
    res.status(404);
    throw new Error("Language not found");
  }

  const updatedLanguage = await Language.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedLanguage);
});

export const getAvailableLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.find({
    _id: {
      $in: await User.distinct("languages", { role: "interpreter" }),
    },
    isActive: true,
  });
  res.json(languages);
});
