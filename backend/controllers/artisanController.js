import mongoose from 'mongoose';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { inMemoryProfiles } from './authController.js';

/**
 * Controller: Get Artisan Profile
 * Endpoint: GET /api/artisan/profile
 * Access: Protected (JWT)
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token payload: user_id missing'
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const profile = await ArtisanProfile.findOne({ user_id: userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });
    } else {
      // In-memory fallback
      const profile = inMemoryProfiles.get(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });
    }
  } catch (error) {
    console.error('[Get Profile Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching artisan profile',
      error: error.message
    });
  }
};

/**
 * Controller: Update Artisan Profile
 * Endpoint: PUT /api/artisan/profile
 * Access: Protected (JWT)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token payload: user_id missing'
      });
    }

    // Extract body and prevent updating sensitive immutable identity fields
    const { user_id, role, profile_id, ...allowedUpdates } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const updatedProfile = await ArtisanProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Artisan profile updated successfully',
        profile: updatedProfile
      });
    } else {
      // In-memory fallback
      const existingProfile = inMemoryProfiles.get(userId);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Artisan profile not found'
        });
      }

      const updatedProfile = {
        ...existingProfile,
        ...allowedUpdates,
        user_id: existingProfile.user_id
      };

      inMemoryProfiles.set(userId, updatedProfile);

      return res.status(200).json({
        success: true,
        message: 'Artisan profile updated successfully',
        profile: updatedProfile
      });
    }
  } catch (error) {
    console.error('[Update Profile Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating artisan profile',
      error: error.message
    });
  }
};

/**
 * Controller: Get Artisan Dashboard Data
 * Endpoint: GET /api/artisan/dashboard
 * Access: Protected (JWT)
 */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let profile = null;
    let productCount = 0;
    if (isMongoConnected) {
      profile = await ArtisanProfile.findOne({ user_id: userId });
      productCount = await Product.countDocuments({ user_id: userId });
    } else {
      profile = inMemoryProfiles.get(userId);
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        artisan_name: profile?.name || 'Artisan',
        business_name: profile?.business_name || '',
        craft_category: profile?.craft_category || '',
        primary_craft: profile?.primary_craft || '',
        location: profile?.location || '',
        language: profile?.language || 'en',
        experience: profile?.experience || '',
        bio: profile?.bio || '',
        profile_image: profile?.profile_image || '',
        product_count: productCount,
        inventory_count: 0,
        verified: true
      }
    });
  } catch (error) {
    console.error('[Get Dashboard Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan dashboard data',
      error: error.message
    });
  }
};

/**
 * Controller: Get Artisan Business Analytics
 * Endpoint: GET /api/artisan/analytics
 * Access: Protected (JWT)
 * Strictly queries MongoDB data for the authenticated artisan (user_id).
 * MongoDB is the single source of truth.
 * Returns real 0s / empty structures if no data exists.
 */
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token payload: user_id missing'
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalProducts: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          totalUnitsSold: 0,
          totalRevenue: 0,
          monthlyRevenue: [],
          inventory: {
            totalUnits: 0,
            inStockProducts: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0,
            available: false
          },
          topProducts: [],
          bestSeller: null
        }
      });
    }

    // Query MongoDB collections strictly for the logged-in artisan
    const products = await Product.find({ user_id: userId });
    const orders = await Order.find({
      $or: [{ user_id: userId }, { artisan_id: userId }]
    });

    const totalProducts = products.length;
    const totalOrders = orders.length;

    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const completedOrderDocs = orders.filter(o => o.status === 'completed');

    const totalRevenue = completedOrderDocs.reduce((sum, o) => {
      const amt = o.total_amount || (o.quantity * o.unit_price) || 0;
      return sum + amt;
    }, 0);

    const totalUnitsSold = completedOrderDocs.reduce((sum, o) => sum + (o.quantity || 1), 0);

    // Calculate inventory statistics
    const hasInventoryData = products.length > 0 && products.some(p => typeof p.stock === 'number');
    let inventory = {
      totalUnits: 0,
      inStockProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      available: false
    };

    if (hasInventoryData) {
      const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
      const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length;
      const inStockProducts = products.filter(p => (p.stock || 0) > 5).length;

      inventory = {
        totalUnits,
        inStockProducts,
        lowStockProducts,
        outOfStockProducts,
        available: true
      };
    }

    // Calculate Best Selling Product
    const salesByProduct = {};
    completedOrderDocs.forEach(o => {
      if (o.product_title) {
        salesByProduct[o.product_title] = (salesByProduct[o.product_title] || 0) + (o.quantity || 1);
      }
    });

    let bestSeller = null;
    let maxSold = 0;
    Object.entries(salesByProduct).forEach(([title, qty]) => {
      if (qty > maxSold) {
        maxSold = qty;
        bestSeller = { title, unitsSold: qty };
      }
    });

    // Monthly revenue trend (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      const revenueForMonth = completedOrderDocs
        .filter(o => {
          const date = o.order_date ? new Date(o.order_date) : null;
          return date && date.getFullYear() === year && date.getMonth() === monthIdx;
        })
        .reduce((sum, o) => sum + (o.total_amount || (o.quantity * o.unit_price) || 0), 0);

      monthlyRevenue.push({
        month: mName,
        revenue: revenueForMonth
      });
    }

    return res.status(200).json({
      success: true,
      analytics: {
        totalProducts,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalUnitsSold,
        totalRevenue,
        monthlyRevenue,
        inventory,
        topProducts: bestSeller ? [bestSeller] : [],
        bestSeller
      }
    });
  } catch (error) {
    console.error('[Get Analytics Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan analytics',
      error: error.message
    });
  }
};

