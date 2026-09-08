import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { OTPInput } from '../components/OTPInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { ShieldCheck, Edit2, RotateCw, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

export const OTPVerificationScreen = () => {
  const { pendingAuth, handleVerifyOTP, setCurrentScreen, loading, showToast } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  // 30 seconds countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await authService.sendOTP(pendingAuth.phone || pendingAuth.userId, 'RESEND');
      showToast('New OTP sent! (Use code: 123456)', 'success');
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      showToast('Failed to resend OTP', 'error');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }
    setError('');
    handleVerifyOTP(otpCode);
  };

  const handleAutoFillDemo = () => {
    setOtpCode('123456');
    setError('');
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 animate-fade-in bg-[#F6F3EE]">
      <div className="w-full space-y-6 pt-2">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-3xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shadow-soft">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify your mobile number
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Enter the 6-digit code sent to{' '}
            <span className="font-bold text-slate-900">{pendingAuth.countryCode} {pendingAuth.phone || '9876543210'}</span>
          </p>

          {/* Change Phone Number Link */}
          <button
            type="button"
            onClick={() => setCurrentScreen(pendingAuth.flow === 'SIGNUP' ? 'SIGNUP' : 'FORGOT_PASSWORD')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-600 hover:underline pt-1 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Change phone number</span>
          </button>
        </div>

        {/* Demo Helper Banner */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Demo Code: <strong>123456</strong></span>
          </div>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* OTP Input Component */}
        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          <OTPInput
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val);
              if (error) setError('');
            }}
            length={6}
            error={!!error}
          />

          {error && (
            <p className="text-xs font-semibold text-red-600 text-center animate-fade-in">{error}</p>
          )}

          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={otpCode.length !== 6}
          >
            Verify & Continue
          </PrimaryButton>
        </form>

        {/* Resend Timer Controls */}
        <div className="text-center pt-4 space-y-2">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-2 text-sm font-bold text-terracotta-600 hover:text-terracotta-700 hover:underline cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Resend OTP Code</span>
            </button>
          ) : (
            <p className="text-xs font-medium text-slate-500">
              Resend OTP in <span className="font-bold text-slate-800">{timer}s</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer Back */}
      <div className="pt-6 pb-2 text-center">
        <button
          type="button"
          onClick={() => setCurrentScreen('LOGIN')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};
