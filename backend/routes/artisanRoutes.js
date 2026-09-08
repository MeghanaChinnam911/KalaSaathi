import express from 'express';
import { getProfile, updateProfile, getDashboard } from '../controllers/artisanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/artisan/profile
 * @desc    Get current authenticated artisan's profile
 * @access  Private (JWT Required)
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/artisan/profile
 * @desc    Update current authenticated artisan's profile
 * @access  Private (JWT Required)
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   GET /api/artisan/dashboard
 * @desc    Get current authenticated artisan's dashboard metrics
 * @access  Private (JWT Required)
 */
router.get('/dashboard', protect, getDashboard);

export default router;
