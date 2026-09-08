import React from 'react';
import { LANGUAGES } from '../services/mockData';
import { Languages, Check } from 'lucide-react';

export const LanguageSelector = ({ selectedLanguage, onSelectLanguage }) => {
  return (
    <div className="w-full text-left space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-terracotta-600" />
          <span>Preferred Language</span>
        </label>
        <span className="text-xs text-slate-400 font-medium">Select your language</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.code)}
              className={`
                touch-target px-4 py-2 rounded-2xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer
                ${isSelected
                  ? 'border-terracotta-500 bg-terracotta-600 text-white shadow-craft ring-2 ring-terracotta-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <span>{lang.native}</span>
              <span className={`text-xs ${isSelected ? 'text-terracotta-100' : 'text-slate-400'}`}>
                ({lang.name})
              </span>
              {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
