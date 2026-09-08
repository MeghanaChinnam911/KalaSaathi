import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new artisan user and create profile
 * @access  Public
 */
router.post('/register', registerUser);

export default router;
