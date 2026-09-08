/**
 * Mock Authentication & Artisan Profile Service
 * Designed cleanly to easily replace with real REST API calls in production.
 *
 * Future REST API Mappings:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/send-otp
 * - POST /auth/verify-otp
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - GET  /artisan/profile
 * - PUT  /artisan/profile
 */

import { DEMO_ARTISAN_PROFILE } from './mockData';

// Utility helper to simulate HTTP network latency
const simulateNetworkDelay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
  constructor() {
    // In-memory mock storage (initialized with demo profile)
    this.currentUser = null;
    this.otpStore = new Map(); // phone -> { code: '123456', expiresAt }
  }

  /**
   * POST /auth/login
   * Login using Phone Number / User ID + Password
   */
  async login(identifier, password) {
    await simulateNetworkDelay(700);

    if (!identifier || !password) {
      throw new Error('Please fill in all required fields.');
    }

    // Demo account shortcut verification
    if (identifier.toLowerCase() === 'ramu_weaver' || identifier === '9876543210') {
      if (password !== 'password123' && password.length < 6) {
        throw new Error('Invalid password. For demo, use: password123');
      }
      this.currentUser = { ...DEMO_ARTISAN_PROFILE };
      return {
        success: true,
        user: this.currentUser,
        token: 'mock_jwt_token_ramubhai_weaver_12345',
        message: 'Login successful! Welcome back, Ramubhai.'
      };
    }

    // Generic registration mock login
    const mockUser = {
      id: 'artisan_' + Date.now(),
      fullName: 'Artisan User',
      userId: identifier.toLowerCase(),
      phone: /^\d+$/.test(identifier) ? identifier : '9800011223',
      countryCode: '+91',
      email: `${identifier}@artisan.org`,
      businessName: `${identifier} Crafts`,
      category: 'handloom',
      categoryName: 'Handloom & Textiles',
      primaryCraft: 'Traditional Craftsmanship',
      location: 'India',
      language: 'en',
      experience: '5+ Years',
      bio: 'Digital artisan expanding to global marketplace.',
      profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
    };

    this.currentUser = mockUser;
    return {
      success: true,
      user: this.currentUser,
      token: 'mock_jwt_token_' + Date.now(),
      message: 'Welcome back to KalaSaathi!'
    };
  }

  /**
   * POST /auth/register
   * Create new artisan account
   */
  async register(registrationData) {
    await simulateNetworkDelay(800);

    const { fullName, phone, userId, password } = registrationData;
    if (!fullName || !phone || !userId || !password) {
      throw new Error('Please fill in all mandatory fields.');
    }

    // Simulate OTP dispatch
    await this.sendOTP(phone, 'SIGNUP');

    return {
      success: true,
      phone,
      userId,
      message: `OTP sent successfully to ${phone}`
    };
  }

  /**
   * POST /auth/send-otp
   */
  async sendOTP(phoneOrIdentifier, purpose = 'VERIFICATION') {
    await simulateNetworkDelay(500);

    // Fixed mock OTP code: 123456 (or random for realism)
    const mockCode = '123456';
    this.otpStore.set(phoneOrIdentifier, {
      code: mockCode,
      expiresAt: Date.now() + 3 * 60 * 1000 // 3 minutes
    });

    console.log(`[MOCK SMS API] Sent OTP code "${mockCode}" to ${phoneOrIdentifier} for ${purpose}`);

    return {
      success: true,
      message: `Verification code sent to ${phoneOrIdentifier}. (Use mock code: 123456)`,
      mockOtpHint: '123456'
    };
  }

  /**
   * POST /auth/verify-otp
   */
  async verifyOTP(phoneOrIdentifier, otpCode) {
    await simulateNetworkDelay(600);

    if (!otpCode || otpCode.length !== 6) {
      throw new Error('Please enter the full 6-digit verification code.');
    }

    // Allow mock default code 123456 or match stored
    if (otpCode === '123456') {
      return {
        success: true,
        message: 'Phone number verified successfully!'
      };
    }

    const storedData = this.otpStore.get(phoneOrIdentifier);
    if (storedData && storedData.code === otpCode) {
      return {
        success: true,
        message: 'Phone number verified successfully!'
      };
    }

    throw new Error('Invalid OTP code. Please enter 123456 or request a new code.');
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(identifier) {
    await simulateNetworkDelay(600);
    if (!identifier) {
      throw new Error('Please enter your Phone Number or User ID.');
    }
    await this.sendOTP(identifier, 'PASSWORD_RESET');
    return {
      success: true,
      identifier,
      message: `OTP sent to reset password for ${identifier}`
    };
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(identifier, newPassword) {
    await simulateNetworkDelay(700);
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    };
  }

  /**
   * PUT /artisan/profile
   * Complete artisan profile onboarding setup
   */
  async updateProfile(profileData) {
    await simulateNetworkDelay(800);

    const updatedUser = {
      ...(this.currentUser || DEMO_ARTISAN_PROFILE),
      ...profileData,
      profileCompleted: true
    };

    this.currentUser = updatedUser;

    return {
      success: true,
      user: updatedUser,
      message: 'Artisan profile saved successfully!'
    };
  }

  /**
   * GET /artisan/profile
   */
  async getProfile() {
    await simulateNetworkDelay(300);
    return {
      success: true,
      user: this.currentUser || DEMO_ARTISAN_PROFILE
    };
  }

  /**
   * Social auth mock (Google / Email)
   */
  async loginWithSocial(provider) {
    await simulateNetworkDelay(700);
    this.currentUser = {
      ...DEMO_ARTISAN_PROFILE,
      fullName: provider === 'google' ? 'Google Artisan User' : 'Email Artisan User',
      email: provider === 'google' ? 'artisan.google@gmail.com' : 'artisan@crafts.org'
    };
    return {
      success: true,
      user: this.currentUser,
      message: `Logged in successfully via ${provider === 'google' ? 'Google' : 'Email'}`
    };
  }

  /**
   * Logout
   */
  logout() {
    this.currentUser = null;
    return { success: true };
  }
}

export const authService = new AuthService();
