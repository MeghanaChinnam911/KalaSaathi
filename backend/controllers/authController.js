import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ArtisanProfile } from '../models/ArtisanProfile.js';

// In-memory mock storage fallback when MongoDB is running with placeholder URI
const inMemoryUsers = new Map();
const inMemoryProfiles = new Map();

/**
 * Controller: Register a new Artisan user and create their ArtisanProfile
 * Endpoint: POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const {
      user_id,
      email,
      phone,
      password,
      name,
      business_name,
      craft_category,
      primary_craft,
      location,
      language,
      experience,
      bio,
      profile_image
    } = req.body;

    // 1. Validate required fields
    if (!user_id || !user_id.trim()) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'password is required and must be at least 6 characters'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'name is required'
      });
    }

    const cleanUserId = user_id.trim().toLowerCase();
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      // --- MONGO DB STORAGE PATH ---

      // 2. Check for duplicate user_id
      const existingUserId = await User.findOne({ user_id: cleanUserId });
      if (existingUserId) {
        return res.status(409).json({
          success: false,
          message: 'user_id already exists. Please choose a different user_id.'
        });
      }

      // 3. Check for duplicate email (if provided)
      if (cleanEmail) {
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email address is already registered.'
          });
        }
      }

      // 4. Check for duplicate phone (if provided)
      if (cleanPhone) {
        const existingPhone = await User.findOne({ phone: cleanPhone });
        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: 'Phone number is already registered.'
          });
        }
      }

      // 5. Hash password with bcryptjs
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 6. Create User document
      const newUser = new User({
        user_id: cleanUserId,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        password_hash,
        role: 'artisan'
      });

      await newUser.save();

      // 7. Create ArtisanProfile document
      const profile_id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      try {
        const newProfile = new ArtisanProfile({
          profile_id,
          user_id: cleanUserId,
          name: name.trim(),
          business_name: business_name ? business_name.trim() : '',
          craft_category: craft_category ? craft_category.trim() : '',
          primary_craft: primary_craft ? primary_craft.trim() : '',
          location: location ? location.trim() : '',
          language: language ? language.trim() : 'en',
          experience: experience ? experience.trim() : '',
          bio: bio ? bio.trim() : '',
          profile_image: profile_image || ''
        });

        await newProfile.save();

        return res.status(201).json({
          success: true,
          message: 'Artisan registered successfully',
          user: {
            user_id: newUser.user_id,
            email: newUser.email || null,
            phone: newUser.phone || null,
            role: newUser.role,
            created_at: newUser.created_at
          },
          profile: {
            profile_id: newProfile.profile_id,
            name: newProfile.name,
            business_name: newProfile.business_name,
            craft_category: newProfile.craft_category,
            primary_craft: newProfile.primary_craft,
            location: newProfile.location,
            language: newProfile.language,
            experience: newProfile.experience,
            bio: newProfile.bio,
            profile_image: newProfile.profile_image
          }
        });
      } catch (profileErr) {
        // Rollback created user to prevent inconsistent data state
        await User.deleteOne({ user_id: cleanUserId });
        throw profileErr;
      }
    } else {
      // --- IN-MEMORY FALLBACK PATH (When MongoDB URI is a placeholder during dev) ---

      // Check duplicates in memory
      if (inMemoryUsers.has(cleanUserId)) {
        return res.status(409).json({
          success: false,
          message: 'user_id already exists. Please choose a different user_id.'
        });
      }

      for (const u of inMemoryUsers.values()) {
        if (cleanEmail && u.email === cleanEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email address is already registered.'
          });
        }
        if (cleanPhone && u.phone === cleanPhone) {
          return res.status(409).json({
            success: false,
            message: 'Phone number is already registered.'
          });
        }
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      const userObj = {
        user_id: cleanUserId,
        email: cleanEmail || null,
        phone: cleanPhone || null,
        password_hash,
        role: 'artisan',
        created_at: new Date()
      };

      const profile_id = 'prof_' + Date.now();
      const profileObj = {
        profile_id,
        user_id: cleanUserId,
        name: name.trim(),
        business_name: business_name || '',
        craft_category: craft_category || '',
        primary_craft: primary_craft || '',
        location: location || '',
        language: language || 'en',
        experience: experience || '',
        bio: bio || '',
        profile_image: profile_image || ''
      };

      inMemoryUsers.set(cleanUserId, userObj);
      inMemoryProfiles.set(cleanUserId, profileObj);

      return res.status(201).json({
        success: true,
        message: 'Artisan registered successfully (Development Mode)',
        user: {
          user_id: userObj.user_id,
          email: userObj.email,
          phone: userObj.phone,
          role: userObj.role,
          created_at: userObj.created_at
        },
        profile: profileObj
      });
    }
  } catch (error) {
    console.error('[Registration Error]', error);

    // Handle Mongoose duplicate key error (11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value for ${field}. This ${field} is already registered.`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: error.message
    });
  }
};
