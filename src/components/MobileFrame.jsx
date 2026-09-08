import React, { useState } from 'react';
import { Smartphone, Monitor, Sparkles, RefreshCw, UserCheck, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileFrame = ({ children }) => {
  // Mode: 'mobile' | 'fullscreen'
  const [viewMode, setViewMode] = useState('mobile');
  const { demoQuickLogin, setCurrentScreen, setUser, showToast } = useAuth();

  const handleResetDemo = () => {
    setUser(null);
    setCurrentScreen('LOGIN');
    showToast('Demo reset to initial state.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#EFEAE1] flex flex-col items-center justify-start text-slate-800 antialiased font-sans select-none">
      {/* Top SIH Presentation Toolbar */}
      <header className="w-full bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-40 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-terracotta-600 text-white font-bold flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold tracking-wide text-amber-400">KalaSaathi</span>
            <span className="hidden sm:inline text-slate-400 font-medium ml-2">| SIH Prototype Auth Frontend</span>
          </div>
        </div>

        {/* Demo Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={demoQuickLogin}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            title="Auto-login with existing artisan Ramubhai"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Quick Demo Login</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Reset Flow to Login Screen"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Viewport Mode Toggle */}
          <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'mobile' ? 'bg-terracotta-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
            <button
              onClick={() => setViewMode('fullscreen')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'fullscreen' ? 'bg-terracotta-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`w-full flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 transition-all ${viewMode === 'fullscreen' ? 'max-w-4xl' : ''}`}>
        {viewMode === 'mobile' ? (
          /* Mobile Device Viewport Mockup */
          <div className="w-full max-w-[430px] h-[100vh] sm:h-[880px] sm:max-h-[92vh] bg-white sm:rounded-[44px] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300">
            {/* iPhone Notch/Speaker & Status Bar */}
            <div className="hidden sm:flex bg-slate-900 text-white text-[11px] font-semibold px-6 py-2 justify-between items-center z-30">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-xs">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile App Viewport */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#F6F3EE]">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="hidden sm:block bg-white py-2 flex justify-center z-30">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        ) : (
          /* Full Responsive Viewport */
          <div className="w-full min-h-[85vh] bg-[#F6F3EE] rounded-3xl border border-slate-300/70 shadow-2xl overflow-hidden relative">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
