import mongoose from 'mongoose';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { inMemoryProfiles } from './authController.js';

// In-memory fallback array for products when MongoDB is offline
export const inMemoryProducts = [];

/**
 * Helper to resolve authenticated user_id from JWT payload
 */
const getAuthUserId = (req) => {
  return req.user?.user_id || req.user?.id || req.user?.userId || null;
};

/**
 * Controller: Get Artisan Profile
 * Endpoint: GET /api/artisan/profile
 * Access: Protected (JWT)
 */
export const getProfile = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

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
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    let products = [];
    let orders = [];

    if (isMongoConnected) {
      try {
        products = (await Product.find({ user_id: userId })) || [];
        orders = (await Order.find({ user_id: userId })) || [];
      } catch (dbErr) {
        console.error('[Get Analytics DB Error]', dbErr.message);
        return res.status(500).json({
          success: false,
          message: 'Database query error while fetching business statistics'
        });
      }
    } else {
      products = (inMemoryProducts || []).filter(p => p.user_id === userId);
    }

    const totalProducts = products.length;
    const totalOrders = orders.length;

    const completedOrders = orders.filter(o => o?.status === 'completed').length;
    const pendingOrders = orders.filter(o => o?.status === 'pending').length;
    const cancelledOrders = orders.filter(o => o?.status === 'cancelled').length;

    const completedOrderDocs = orders.filter(o => o?.status === 'completed');

    const totalRevenue = completedOrderDocs.reduce((sum, o) => {
      const amt = o?.total_amount || (o?.quantity * o?.unit_price) || 0;
      return sum + amt;
    }, 0);

    const totalUnitsSold = completedOrderDocs.reduce((sum, o) => sum + (o?.quantity || 1), 0);

    const totalUnits = products.reduce((sum, p) => sum + (p?.stock || 0), 0);
    const lowStockProducts = products.filter(p => (p?.stock || 0) > 0 && (p?.stock || 0) <= 5).length;
    const outOfStockProducts = products.filter(p => (p?.stock || 0) === 0).length;
    const inStockProducts = products.filter(p => (p?.stock || 0) > 5).length;

    const inventory = {
      totalUnits,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      available: true
    };

    const salesByProduct = {};
    completedOrderDocs.forEach(o => {
      if (o?.product_title) {
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
          const date = o?.order_date ? new Date(o.order_date) : null;
          return date && date.getFullYear() === year && date.getMonth() === monthIdx;
        })
        .reduce((sum, o) => sum + (o?.total_amount || (o?.quantity * o?.unit_price) || 0), 0);

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
        monthlyRevenue: [
          { month: 'Jan', revenue: 0 },
          { month: 'Feb', revenue: 0 },
          { month: 'Mar', revenue: 0 },
          { month: 'Apr', revenue: 0 },
          { month: 'May', revenue: 0 },
          { month: 'Jun', revenue: 0 }
        ],
        inventory: {
          totalUnits: 0,
          inStockProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          available: true
        },
        topProducts: [],
        bestSeller: null
      }
    });
  }
};

/**
 * Controller: Create Artisan Product
 * Endpoint: POST /api/artisan/products
 * Access: Protected (JWT)
 */
export const createProduct = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      console.warn('[Create Product Auth Error] User identity missing from JWT token');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

    const userRole = req.user?.role || 'artisan';
    const { title, description, category, price, stock, images } = req.body;

    console.log('[Create Product Audit Log]', {
      reqUserExists: Boolean(req.user),
      authenticatedUserId: userId,
      authenticatedRole: userRole,
      receivedBodyKeys: Object.keys(req.body || {}),
      title: title ? title.trim() : null,
      category: category ? category.trim() : null,
      price,
      stock,
      imagesCount: Array.isArray(images) ? images.length : (images ? 1 : 0)
    });

    if (!title || !title.trim()) {
      console.warn('[Create Product Validation Error] Missing title');
      return res.status(400).json({
        success: false,
        message: 'Product title is required'
      });
    }

    const numericPrice = Number(price);
    if (price === undefined || price === null || isNaN(numericPrice) || numericPrice < 0) {
      console.warn('[Create Product Validation Error] Invalid price:', price);
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative selling price is required'
      });
    }

    const numericStock = Number(stock);
    if (stock === undefined || stock === null || isNaN(numericStock) || numericStock < 0) {
      console.warn('[Create Product Validation Error] Invalid stock:', stock);
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative stock quantity is required'
      });
    }

    const productId = 'PROD_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const isMongoConnected = mongoose.connection.readyState === 1;

    // Process and filter valid image data strings (rejecting temporary blob: URLs)
    const rawImages = Array.isArray(images) ? images : (images ? [images] : []);
    const processedImages = rawImages.filter(img => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:'));

    const productPayload = {
      product_id: productId,
      user_id: userId,
      title: title.trim(),
      description: (description || '').trim(),
      category: (category || '').trim(),
      price: numericPrice,
      stock: numericStock,
      images: processedImages,
      status: 'active',
      created_at: new Date()
    };

    console.log('[Create Product Pre-Save Audit]', {
      assignedProductId: productId,
      assignedUserId: userId,
      isMongoConnected
    });

    if (isMongoConnected) {
      const newProduct = await Product.create(productPayload);
      console.log('[Create Product Success] Saved to MongoDB:', newProduct.product_id);
      return res.status(201).json({
        success: true,
        message: 'Craft product added to catalog successfully!',
        product: newProduct
      });
    } else {
      inMemoryProducts.unshift(productPayload);
      console.log('[Create Product Success] Saved In-Memory:', productPayload.product_id);
      return res.status(201).json({
        success: true,
        message: 'Craft product added to catalog successfully (In-Memory)!',
        product: productPayload
      });
    }
  } catch (error) {
    console.error('[Create Product Error]', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        details: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate product entry detected'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to publish product. Please check the product details and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Controller: Get Artisan Products
 * Endpoint: GET /api/artisan/products
 * Access: Protected (JWT)
 */
export const getProducts = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const products = await Product.find({ user_id: userId }).sort({ created_at: -1 });
      return res.status(200).json({
        success: true,
        products
      });
    } else {
      const products = inMemoryProducts.filter(p => p.user_id === userId);
      return res.status(200).json({
        success: true,
        products
      });
    }
  } catch (error) {
    console.error('[Get Products Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * Controller: Delete Product
 * Endpoint: DELETE /api/artisan/products/:id
 * Access: Protected (JWT)
 */
export const deleteProduct = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

    const productId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      await Product.deleteOne({ product_id: productId, user_id: userId });
    } else {
      const idx = inMemoryProducts.findIndex(p => p.product_id === productId && p.user_id === userId);
      if (idx !== -1) inMemoryProducts.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from catalog'
    });
  } catch (error) {
    console.error('[Delete Product Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

/**
 * Controller: Update Product
 * Endpoint: PUT /api/artisan/products/:product_id
 * Access: Protected (JWT)
 *
 * Security:
 *   - user_id is obtained EXCLUSIVELY from the verified JWT (req.user).
 *   - Any user_id in the request body is ignored.
 *   - Artisan may only update their OWN products (403 if ownership fails).
 *
 * HTTP Status codes:
 *   200 → successful update
 *   400 → validation error (empty title, invalid price/stock)
 *   401 → authentication missing / invalid token
 *   403 → product belongs to another artisan
 *   404 → product not found
 *   500 → unexpected server error
 */
export const updateProduct = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User identity missing or invalid token.'
      });
    }

    const productId = req.params.product_id;

    // Strip any attempt to override identity fields from body
    const {
      user_id: _ignoredUserId,
      product_id: _ignoredProductId,
      _id: _ignoredMongoId,
      title,
      description,
      category,
      sector,
      material,
      product_size,
      price,
      stock
    } = req.body;

    // --- Validation ---
    if (title !== undefined && (!title || !String(title).trim())) {
      return res.status(400).json({ success: false, message: 'Product title must not be empty.' });
    }

    let numericPrice;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
      }
    }

    let numericStock;
    if (stock !== undefined) {
      numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
        return res.status(400).json({ success: false, message: 'Stock must be a valid non-negative integer.' });
      }
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      // Fetch the existing product first to verify ownership
      const existing = await Product.findOne({ product_id: productId });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (existing.user_id !== userId) {
        console.warn('[Update Product] Ownership mismatch', {
          requestedBy: userId,
          productOwner: existing.user_id,
          productId
        });
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to edit this product.'
        });
      }

      // Build update payload — only include fields that were provided
      const updates = {};
      if (title !== undefined) updates.title = String(title).trim();
      if (description !== undefined) updates.description = String(description).trim();
      if (category !== undefined) updates.category = String(category).trim();
      if (sector !== undefined) updates.sector = String(sector).trim();
      if (material !== undefined) updates.material = String(material).trim();
      if (product_size !== undefined) updates.product_size = String(product_size).trim();
      if (numericPrice !== undefined) updates.price = numericPrice;
      if (numericStock !== undefined) updates.stock = numericStock;

      const updated = await Product.findOneAndUpdate(
        { product_id: productId, user_id: userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      console.log('[Update Product Success] MongoDB:', productId, 'by', userId);
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully!',
        product: updated
      });

    } else {
      // In-memory fallback
      const idx = inMemoryProducts.findIndex(p => p.product_id === productId);

      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (inMemoryProducts[idx].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to edit this product.'
        });
      }

      const updated = { ...inMemoryProducts[idx] };
      if (title !== undefined) updated.title = String(title).trim();
      if (description !== undefined) updated.description = String(description).trim();
      if (category !== undefined) updated.category = String(category).trim();
      if (sector !== undefined) updated.sector = String(sector).trim();
      if (material !== undefined) updated.material = String(material).trim();
      if (product_size !== undefined) updated.product_size = String(product_size).trim();
      if (numericPrice !== undefined) updated.price = numericPrice;
      if (numericStock !== undefined) updated.stock = numericStock;

      inMemoryProducts[idx] = updated;
      console.log('[Update Product Success] In-Memory:', productId, 'by', userId);
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully!',
        product: updated
      });
    }
  } catch (error) {
    console.error('[Update Product Error]', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to update product. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

