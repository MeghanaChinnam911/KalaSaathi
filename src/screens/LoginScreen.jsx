import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { PasswordInput } from '../components/PasswordInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { User, HeartHandshake, ArrowRight, Sparkles } from 'lucide-react';
import { validateUserId, validatePassword } from '../utils/validation';

export const LoginScreen = () => {
  const { handleLogin, handleSocialLogin, setCurrentScreen, loading, demoQuickLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();

    const idError = validateUserId(identifier);
    const passError = validatePassword(password);

    if (idError || passError) {
      setErrors({
        identifier: idError,
        password: passError
      });
      return;
    }

    setErrors({});
    handleLogin(identifier, password);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 animate-fade-in bg-[#F6F3EE]">
      {/* Header Section */}
      <div className="w-full space-y-6 pt-2">
        <div className="flex items-center justify-between">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta-600 to-terracotta-500 text-white flex items-center justify-center shadow-craft">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">
                Kala<span className="text-terracotta-600">Saathi</span>
              </h1>
              <p className="text-xs font-semibold text-terracotta-700">Your digital business manager</p>
            </div>
          </div>

          {/* Quick Demo Shortcut Pill */}
          <button
            type="button"
            onClick={demoQuickLogin}
            className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 transition-all shadow-sm cursor-pointer"
            title="Auto-fill Ramubhai demo credentials"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Login</span>
          </button>
        </div>

        {/* Welcome Headline */}
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Sign in to manage your craft business and connect with buyers.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <CustomInput
            id="login-identifier"
            label="User ID or Phone Number"
            type="text"
            placeholder="e.g. ramu_weaver or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={errors.identifier}
            icon={User}
            required
            autoComplete="username"
          />

          <div className="space-y-1">
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setCurrentScreen('FORGOT_PASSWORD')}
                className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 hover:underline transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            loading={loading}
            icon={ArrowRight}
            className="mt-2"
          >
            Sign In
          </PrimaryButton>
        </form>

        {/* Social Login Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
            <span className="bg-[#F6F3EE] px-3 text-slate-400">OR</span>
          </div>
        </div>

        {/* Alternative Social Logins */}
        <div className="space-y-3">
          <SocialLoginButton provider="google" onClick={() => handleSocialLogin('google')} disabled={loading} />
          <SocialLoginButton provider="email" onClick={() => handleSocialLogin('email')} disabled={loading} />
        </div>
      </div>

      {/* Footer Switch to Signup */}
      <div className="pt-6 pb-2 text-center">
        <p className="text-sm text-slate-600 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentScreen('SIGNUP')}
            className="font-extrabold text-terracotta-600 hover:text-terracotta-700 hover:underline cursor-pointer ml-1"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
