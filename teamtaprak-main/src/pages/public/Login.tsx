import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const ssuConventionCenterBg = '/ssu_convention_center.jpg';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email/Student ID and password.');
      return;
    }

    try {
      const loggedInUser = await login(email.trim(), password);
      // Redirect to appropriate dashboard based on role
      if (loggedInUser.role === 'student') {
        navigate('/student/dashboard');
      } else if (loggedInUser.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard'); // default fallback
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setError(message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/login`
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="flex-1 h-[calc(100vh-64px)] flex flex-col justify-between relative overflow-hidden">
      {/* Background Image of Samar State University Convention Center */}
      <div className="login-page-background absolute inset-0 z-0">
        <img
          src={ssuConventionCenterBg}
          alt="Samar State University Convention Center"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Atmospheric Sky Blue overlay so image is clearly visible and content remains highly legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950/85 via-sky-900/75 to-sky-900/65 backdrop-blur-[1px]"></div>
        {/* Subtle decorative glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16 w-full max-w-[1600px] mx-auto flex-1 flex items-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="login-page-copy flex flex-col lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 border border-yellow-500 text-xs font-black px-3 py-1 rounded-full uppercase mb-4 shadow-md self-start">
              Samar State University • Main Campus
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight mb-4 leading-[1.15] max-w-xl drop-shadow-md">
              Online Student Clearance System
            </h2>
            
            <p className="text-base sm:text-lg text-sky-100 font-medium leading-relaxed max-w-xl mb-8 drop-shadow-xs">
              Sign in to your official university account to submit clearance requests and track real-time faculty approvals.
            </p>

          </div>

          {/* Right Column - Login Card */}
          <div className="flex justify-center lg:justify-end lg:col-span-5">
            <div className="login-card-enter bg-white/95 backdrop-blur-md p-8 lg:p-10 rounded-3xl border-2 border-yellow-400/80 shadow-[0_16px_40px_-8px_rgba(202,138,4,0.15)] w-full max-w-[460px]">
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-full mb-2">
                  <span className="text-xs font-extrabold text-yellow-800 uppercase tracking-wider">SSU Portal Access</span>
                </div>
                <h3 className="text-[28px] font-black text-sky-950 mb-1">Sign In</h3>
                <p className="text-[14px] text-sky-800/80 font-medium">Enter your institutional credentials</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Student ID or Institutional Email"
                  type="text"
                  placeholder="Enter your student ID or email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  error={error}
                  className="h-11 border-sky-200 focus:ring-yellow-400"
                  required
                />
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-sky-950">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-yellow-700 font-extrabold hover:text-yellow-800 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-sky-200 focus:ring-yellow-400 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600 hover:text-sky-800"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-yellow-950 font-black text-base mt-2 rounded-xl shadow-md shadow-yellow-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50" 
                >
                  {isLoading ? 'Signing in...' : 'Log In'}
                </button>

                <div className="pt-2 text-center text-sm text-sky-900/80 font-medium">
                  <span>First time registering? </span>
                  <Link to="/register" className="text-yellow-700 font-extrabold hover:text-yellow-800 hover:underline">
                    Create Student Account
                  </Link>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border-2 border-yellow-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-yellow-100 text-yellow-800 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-sky-950">Reset Account Password</h3>
                <p className="text-xs text-yellow-700 font-bold">SSU Management &amp; Information System</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm text-center">
                <p className="font-semibold">Reset instructions sent!</p>
                <p className="text-xs text-emerald-600 mt-1">Please check your official SSU WebMail for the password recovery link.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-sky-900">
                  Enter your registered institutional email address or student ID to receive instructions to reset your password.
                </p>
                <Input
                  label="Institutional Email"
                  type="email"
                  placeholder="yourname@ssu.edu.ph"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 px-5 py-2 text-sm font-bold rounded-lg shadow-xs">
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-sky-950/85 backdrop-blur-md border-t border-sky-800/80 pt-10 pb-8 px-6 md:px-12 lg:px-24 mt-auto relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
            <div className="max-w-md">
              <h4 className="font-black text-white mb-1 flex items-center gap-2">
                <span>Samar State University</span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </h4>
              <p className="text-sky-200 text-sm leading-relaxed font-medium">
                Online Student Clearance System. Simplifying academic clearance workflows with instructor signatures, grade records, and submission timestamps.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Student Clearance Guidelines</span>
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Faculty Signing Portal</span>
              <span className="font-bold text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors">Office of Academic Affairs</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-sky-800/80 text-xs text-sky-300/80 font-medium">
            <p>© 2026 Samar State University - Office of Student Affairs &amp; Services. All rights reserved.</p>
            <p className="mt-3 md:mt-0">Philippine Government State Universities and Colleges (SUC) Web Standard</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
