import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  ChevronRight, 
  User,
  HeartHandshake
} from 'lucide-react';

export const ArtisanDashboardScreen = () => {
  const { user, handleLogout, setCurrentScreen } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mock product items for initial catalog preview
  const sampleProducts = [
    {
      id: 1,
      title: 'Handwoven Chanderi Silk Saree',
      price: '₹4,850',
      aiPriceTag: 'Fair Market Range: ₹4,500 - ₹5,200',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
      languageCount: '10 Languages'
    },
    {
      id: 2,
      title: 'Kutch Embroided Clutch Bag',
      price: '₹1,250',
      aiPriceTag: 'Fair Market Range: ₹1,100 - ₹1,400',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=300&q=80',
      languageCount: '8 Languages'
    }
  ];

  return (
    <div className="min-h-full bg-[#F6F3EE] flex flex-col justify-between animate-fade-in pb-16 text-left">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-terracotta-600 text-white flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              Kala<span className="text-terracotta-600">Saathi</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Artisan Manager
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Profile Settings"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
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
                <h2 className="font-extrabold text-lg sm:text-xl text-white">{user?.businessName || user?.fullName || 'Ramubhai Weaver'}</h2>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-terracotta-200 font-medium">{user?.categoryName || 'Handloom & Textiles'}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" />
                  {user?.location || 'Kutch, Gujarat'}
                </span>
                <span>•</span>
                <span>{user?.experience || '15+ Years Exp'}</span>
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
              <h4 className="font-bold text-sm text-slate-900">Digitize New Craft Item</h4>
              <p className="text-xs text-slate-600">Snap a photo &rarr; AI enhances background &amp; generates catalog</p>
            </div>
          </div>
          <button
            onClick={() => alert('Demo Mode: Product Digitization connects to AI engine in full build!')}
            className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* AI Toolkit Features Grid */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-terracotta-600" />
            <span>AI Business Manager Tools</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Tool 1 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all space-y-2 cursor-pointer">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 w-max">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">AI Photo Enhancer</h4>
              <p className="text-[11px] text-slate-500">Auto studio lighting &amp; background removal</p>
            </div>

            {/* Tool 2 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all space-y-2 cursor-pointer">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 w-max">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">AI Price Suggester</h4>
              <p className="text-[11px] text-slate-500">Fair market price evaluation</p>
            </div>

            {/* Tool 3 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all space-y-2 cursor-pointer">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 w-max">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Multilingual Catalog</h4>
              <p className="text-[11px] text-slate-500">Translate listings into 10+ languages</p>
            </div>

            {/* Tool 4 */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft hover:shadow-md transition-all space-y-2 cursor-pointer">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 w-max">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Buyer Connect</h4>
              <p className="text-[11px] text-slate-500">Direct inquiries &amp; craft orders</p>
            </div>
          </div>
        </div>

        {/* Product Catalog Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Your Product Catalog</h3>
            <span className="text-xs font-bold text-terracotta-600">2 Products Active</span>
          </div>

          <div className="space-y-3">
            {sampleProducts.map((prod) => (
              <div key={prod.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-soft flex items-center gap-3">
                <img src={prod.image} alt={prod.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{prod.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-sm text-terracotta-700">{prod.price}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{prod.languageCount}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{prod.aiPriceTag}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-floating animate-pop-in text-left">
            <h3 className="font-extrabold text-lg text-slate-900">Artisan Profile Settings</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Name:</strong> {user?.fullName}</p>
              <p><strong>User ID:</strong> {user?.userId}</p>
              <p><strong>Mobile:</strong> {user?.countryCode} {user?.phone}</p>
              <p><strong>Business:</strong> {user?.businessName}</p>
              <p><strong>Craft:</strong> {user?.categoryName}</p>
              <p><strong>Language:</strong> {user?.language?.toUpperCase()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setCurrentScreen('PROFILE_SETUP');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-terracotta-600 text-white font-bold text-xs hover:bg-terracotta-700 transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
