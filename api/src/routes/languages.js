import express from "express";
import {
  getLanguages,
  addLanguage,
  updateLanguage,
  getAvailableLanguages,
} from "../controllers/languages.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getLanguages);
router.post("/", protect, admin, addLanguage);
router.patch("/:id", protect, admin, updateLanguage);
router.get("/available", getAvailableLanguages);

export default router;
