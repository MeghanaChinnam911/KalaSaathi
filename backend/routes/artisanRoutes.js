import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getDashboard, 
  getAnalytics,
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct
} from '../controllers/artisanController.js';
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

/**
 * @route   GET /api/artisan/analytics
 * @desc    Get current authenticated artisan's real business analytics from MongoDB
 * @access  Private (JWT Required)
 */
router.get('/analytics', protect, getAnalytics);

/**
 * @route   GET /api/artisan/products
 * @desc    Get all craft products for logged in artisan
 * @access  Private (JWT Required)
 */
router.get('/products', protect, getProducts);

/**
 * @route   POST /api/artisan/products
 * @desc    Create a new craft product in artisan catalog
 * @access  Private (JWT Required)
 */
router.post('/products', protect, createProduct);

/**
 * @route   PUT /api/artisan/products/:product_id
 * @desc    Update an existing craft product (owner only)
 * @access  Private (JWT Required)
 */
router.put('/products/:product_id', protect, updateProduct);

/**
 * @route   DELETE /api/artisan/products/:id
 * @desc    Delete a product from artisan catalog
 * @access  Private (JWT Required)
 */
router.delete('/products/:id', protect, deleteProduct);

export default router;


