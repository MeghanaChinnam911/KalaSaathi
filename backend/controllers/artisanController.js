import mongoose from 'mongoose';
import { ArtisanProfile } from '../models/ArtisanProfile.js';
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
    if (isMongoConnected) {
      profile = await ArtisanProfile.findOne({ user_id: userId });
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
        product_count: 0,
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
