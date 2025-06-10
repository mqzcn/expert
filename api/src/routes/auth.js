import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  changePassword,
  setUserAvailability,
  getMe
} from '../controllers/auth.js';
import { protect, interpreter } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.put('/profile', protect, updateUserProfile);
router.post('/change-password', protect, changePassword);
router.put('/availability', protect, interpreter, setUserAvailability);
router.get('/me', protect, getMe);

export default router;