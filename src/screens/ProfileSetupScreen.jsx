import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CategorySelector } from '../components/CategorySelector';
import { LanguageSelector } from '../components/LanguageSelector';
import { ProfileImagePicker } from '../components/ProfileImagePicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { Sparkles, MapPin, Award, Mic, ArrowRight, Building } from 'lucide-react';
import { CRAFT_CATEGORIES } from '../services/mockData';

export const ProfileSetupScreen = () => {
  const { user, handleCompleteProfileSetup, loading, language, setLanguage } = useAuth();

  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [businessName, setBusinessName] = useState(user?.businessName || user?.fullName + ' Creations' || '');
  const [category, setCategory] = useState(user?.category || 'handloom');
  const [primaryCraft, setPrimaryCraft] = useState(user?.primaryCraft || '');
  const [location, setLocation] = useState(user?.location || '');
  const [experience, setExperience] = useState('5-10 Years');
  const [bio, setBio] = useState(user?.bio || '');
  const [isDictating, setIsDictating] = useState(false);
  const [errors, setErrors] = useState({});

  const EXPERIENCE_OPTIONS = ['1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];

  const handleVoiceDictationMock = () => {
    setIsDictating(true);
    setTimeout(() => {
      setBio('Master artisan with years of experience crafting handmade traditional heritage products.');
      setIsDictating(false);
    }, 1500);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!businessName.trim()) {
      setErrors({ businessName: 'Please enter your business or artisan name' });
      return;
    }

    if (!category) {
      setErrors({ category: 'Please select a craft category' });
      return;
    }

    const selectedCategoryObj = CRAFT_CATEGORIES.find((c) => c.id === category);

    const profileData = {
      profilePic,
      businessName,
      category,
      categoryName: selectedCategoryObj?.title || 'Handcrafted Goods',
      primaryCraft: primaryCraft || 'Traditional Handmade Crafts',
      location: location || 'India',
      language,
      experience,
      bio
    };

    handleCompleteProfileSetup(profileData);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 animate-fade-in bg-[#F6F3EE]">
      <div className="w-full space-y-6 pt-2">
        {/* Title Header */}
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 2 of 2: Artisan Onboarding</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tell us about your craft
          </h2>
          <p className="text-sm font-medium text-slate-500">
            This helps us personalize your business experience and connect you with buyers.
          </p>
        </div>

        {/* Profile Image Picker */}
        <ProfileImagePicker
          selectedImage={profilePic}
          onImageChange={setProfilePic}
        />

        {/* Form Body */}
        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          <CustomInput
            id="profile-business-name"
            label="Artisan / Business Name"
            placeholder="e.g. Vankar Handloom Creations"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            error={errors.businessName}
            icon={Building}
            required
          />

          {/* Visual Craft Category Selector */}
          <CategorySelector
            selectedCategory={category}
            onSelectCategory={setCategory}
            error={errors.category}
          />

          {/* Primary Craft Details */}
          <CustomInput
            id="profile-primary-craft"
            label="Primary Specialty Craft"
            placeholder="e.g. Chanderi Silk Sarees, Clay Terracotta Vases"
            value={primaryCraft}
            onChange={(e) => setPrimaryCraft(e.target.value)}
            icon={Sparkles}
            optional
          />

          {/* Location Field */}
          <CustomInput
            id="profile-location"
            label="City & State / Region"
            placeholder="e.g. Kutch, Gujarat or Varanasi, UP"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            icon={MapPin}
            optional
          />

          {/* Language Selector */}
          <LanguageSelector
            selectedLanguage={language}
            onSelectLanguage={setLanguage}
          />

          {/* Experience Level Selector */}
          <div className="w-full text-left space-y-2">
            <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-terracotta-600" />
              <span>Years of Craft Experience</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExperience(opt)}
                  className={`touch-target py-2 px-3 rounded-2xl border text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer ${
                    experience === opt
                      ? 'border-terracotta-500 bg-terracotta-600 text-white shadow-craft'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Bio / Short Intro with Voice Dictation */}
          <div className="w-full text-left space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <label htmlFor="profile-bio" className="block text-sm font-semibold text-slate-800">
                Short Craft Bio / Story
              </label>
              <button
                type="button"
                onClick={handleVoiceDictationMock}
                className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-600 bg-terracotta-50 hover:bg-terracotta-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                <Mic className={`w-3.5 h-3.5 ${isDictating ? 'animate-pulse text-red-600' : ''}`} />
                <span>{isDictating ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            <textarea
              id="profile-bio"
              rows={3}
              placeholder="Tell buyers about your traditional technique, family heritage, or craft history..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl p-4 text-slate-900 font-medium placeholder-slate-400 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-500/15 shadow-sm resize-none"
            />
          </div>

          <PrimaryButton
            type="submit"
            loading={loading}
            icon={ArrowRight}
            className="mt-4"
          >
            Complete Profile & Launch Manager
          </PrimaryButton>
        </form>
      </div>

      <div className="pt-6 pb-2 text-center">
        <p className="text-xs text-slate-400 font-medium">
          You can update your business profile anytime in settings.
        </p>
      </div>
    </div>
  );
};
