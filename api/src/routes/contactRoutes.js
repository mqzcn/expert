import express from 'express';
import { handleContactForm } from '../controllers/contactController.js'; // Adjust path if needed

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', handleContactForm);

export default router;
