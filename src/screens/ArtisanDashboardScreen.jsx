import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { VirtualBusinessManager } from '../components/VirtualBusinessManager';
import { 
  Sparkles, 
  Camera, 
  DollarSign, 
  Globe, 
  Plus, 
  MapPin, 
  LogOut, 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  User,
  HeartHandshake,
  PackageOpen,
  Languages
} from 'lucide-react';

export const ArtisanDashboardScreen = () => {
  const { user, handleLogout, setCurrentScreen } = useAuth();
  const { t, language, setLanguage, languages } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-full bg-[#F6F3EE] flex flex-col justify-between animate-fade-in pb-16 text-left">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-terracotta-600 text-white flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              Kala<span className="text-terracotta-600">Saathi</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('common.verifiedManager')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Header Language Dropdown Selector */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-xl px-2 py-1 transition-colors">
            <Languages className="w-4 h-4 text-terracotta-600 mr-1 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer pr-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={t('nav.profile')}
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Artisan Hero Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-terracotta-700 via-terracotta-800 to-slate-900 text-white shadow-floating relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full border-2 border-amber-300 shadow-md overflow-hidden bg-slate-700 flex-shrink-0">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-3 text-slate-300" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-lg sm:text-xl text-white">
                  {user?.businessName || user?.fullName || t('dashboard.artisanUser')}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-terracotta-200 font-medium">
                {user?.categoryName || user?.category || t('dashboard.categoryNotSet')}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" />
                  {user?.location || t('dashboard.locationNotSet')}
                </span>
                <span>•</span>
                <span>{user?.experience ? `${user.experience}` : t('dashboard.experienceNotSet')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Product CTA */}
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{t('dashboard.digitizeCraft')}</h4>
              <p className="text-xs text-slate-600">{t('dashboard.digitizeDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => alert(t('dashboard.digitizeNotice'))}
            className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Virtual Business Manager Section */}
        <VirtualBusinessManager />

        {/* Product Catalog Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">{t('dashboard.yourProductCatalog')}</h3>
            <span className="text-xs font-bold text-slate-500">{t('dashboard.productsCount')}</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2">
            <PackageOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">{t('dashboard.noProducts')}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {t('dashboard.noProductsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-floating animate-pop-in text-left">
            <h3 className="font-extrabold text-lg text-slate-900">{t('profile.settingsTitle')}</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>{t('profile.name')}:</strong> {user?.fullName || t('common.notProvided')}</p>
              <p><strong>{t('profile.userId')}:</strong> {user?.userId || t('common.notProvided')}</p>
              <p><strong>{t('profile.email')}:</strong> {user?.email || t('common.notProvided')}</p>
              <p><strong>{t('profile.businessName')}:</strong> {user?.businessName || t('common.notProvided')}</p>
              <p><strong>{t('profile.craftCategory')}:</strong> {user?.categoryName || user?.category || t('common.notProvided')}</p>
              <p><strong>{t('profile.location')}:</strong> {user?.location || t('common.notProvided')}</p>
              <p><strong>{t('profile.experience')}:</strong> {user?.experience || t('common.notProvided')}</p>
              <p><strong>{t('profile.language')}:</strong> {user?.language?.toUpperCase() || language.toUpperCase()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setCurrentScreen('PROFILE_SETUP');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-terracotta-600 text-white font-bold text-xs hover:bg-terracotta-700 transition cursor-pointer"
              >
                {t('profile.editProfile')}
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
