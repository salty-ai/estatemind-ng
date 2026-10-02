'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, User, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'seeker' | 'agent';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const formDisabled = loading || confirmationRequired;

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address to resend the confirmation link.');
      return;
    }

    setResendLoading(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (resendError) {
      setError(resendError.message);
      setResendLoading(false);
      return;
    }

    setNotice('Confirmation email resent. Please check your inbox.');
    setResendLoading(false);
    setResendCooldown(30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    setConfirmationRequired(false);
    setResendCooldown(0);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const signedUpUser = signUpData.user;
    const signedUpSession = signUpData.session;

    if (!signedUpUser || !signedUpSession) {
      setNotice('Account created. Please check your email to confirm before signing in.');
      setConfirmationRequired(true);
      setLoading(false);
      return;
    }

    // Update the profile with the selected role
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update(
        { role: role as 'seeker' | 'agent', full_name: fullName } as Record<string, unknown>
      )
      .eq('id', signedUpUser.id)
      .select('id');

    if (updateError) {
      console.error('Profile update failed during signup:', updateError);
      setError('Account created, but we could not update your profile. Please try again.');
      setLoading(false);
      return;
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      setError('Profile not found or unauthorized');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
      <p className="text-slate-600 mb-6">Join EstateMind and find your perfect property</p>

      {notice && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-sm">
          {notice}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {confirmationRequired && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-blue-800">
          <h2 className="text-lg font-semibold mb-2">Check your email</h2>
          <p className="text-sm mb-4">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Please
            confirm your email before signing in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendLoading || resendCooldown > 0}
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? 'Resending...'
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend confirmation email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmationRequired(false);
                setNotice(null);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Use a different email
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={formDisabled} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            I am a... <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                role === 'seeker'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">Property Seeker</span>
              <span className="text-xs opacity-75">Looking to rent or buy</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                role === 'agent'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Briefcase className="w-6 h-6" />
              <span className="font-medium">Property Agent</span>
              <span className="text-xs opacity-75">List and manage properties</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all pr-12"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={formDisabled}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
        </fieldset>
      </form>

      <p className="text-center text-slate-600 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
