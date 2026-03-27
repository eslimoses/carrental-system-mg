import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // OTP States
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setOtpLoading(true);
    try {
      await authAPI.sendOtp(formData.email, formData.phone);
      setStep('otp');
      setTimer(300); // 5 minutes
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);

    try {
      // 1. Verify OTP first
      await authAPI.verifyOtp(formData.phone, otp);

      // 2. If otp valid, proceed with registration
      await registerCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid verification code.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setOtpLoading(true);
    try {
      await authAPI.sendOtp(formData.email, formData.phone);
      setTimer(300);
    } catch (err: any) {
      setOtpError('Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden font-sans py-12">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 border border-slate-800/50">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.div 
                   animate={{ scale: [1, 1.1, 1] }} 
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                  <FiCheckCircle className="text-green-500 text-6xl" />
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Account Created</h2>
                <p className="text-slate-400 font-medium">Welcome to the MotoGlide family! Redirecting...</p>
              </motion.div>
            ) : step === 'form' ? (
              <motion.div key="form">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight">Register</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Start your journey today</p>
                   </div>
                   <Link 
                     to="/login"
                     className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-colors"
                   >
                     <FiArrowLeft className="w-5 h-5" />
                   </Link>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl mb-8 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">First Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          placeholder="John"
                          className="w-full bg-slate-950/50 text-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Last Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Doe"
                          className="w-full bg-slate-950/50 text-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full bg-slate-950/50 text-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Phone</label>
                      <div className="relative">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="9876543210"
                          className="w-full bg-slate-950/50 text-white pl-11 pr-4 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 text-white pl-11 pr-12 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm password"
                        className="w-full bg-slate-950/50 text-white pl-11 pr-12 py-3.5 rounded-2xl border border-slate-850 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={otpLoading}
                    className="w-full relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 hover:shadow-indigo-600/30 transition-shadow"
                  >
                    {otpLoading ? (
                       <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        VERIFY EMAIL 
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      Already have an account?{' '}
                      <Link to="/login" className="text-white hover:text-blue-500 transition-colors">
                        Sign In
                      </Link>
                   </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tight">Security</h2>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Check your email for OTP</p>
                   </div>
                   <button 
                     onClick={() => setStep('form')}
                     className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-colors"
                   >
                     <FiArrowLeft className="w-5 h-5" />
                   </button>
                </div>

                {otpError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl mb-8 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full" />
                    {otpError}
                  </motion.div>
                )}

                <div className="bg-blue-600/5 rounded-3xl p-6 border border-blue-500/10 mb-8">
                   <p className="text-slate-400 text-sm leading-relaxed">
                      We've sent a 6-digit verification code to <span className="text-white font-bold">{formData.email}</span>. Please enter it below to complete your registration.
                   </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="group">
                    <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-1 text-center">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder="0 0 0 0 0 0"
                      className="w-full bg-slate-950/50 text-white text-center text-4xl font-black tracking-[0.3em] py-5 rounded-3xl border border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                       <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      'COMPLETE REGISTRATION'
                    )}
                  </motion.button>
                </form>

                <div className="mt-10 text-center">
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      Didn't receive the code?{' '}
                      <button 
                         onClick={handleResendOtp}
                         disabled={timer > 0 || otpLoading}
                         className={`${timer > 0 ? 'text-slate-700' : 'text-blue-500 hover:text-blue-400'} font-black transition-colors`}
                      >
                         {timer > 0 ? `Resend in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')}` : 'Resend Now'}
                      </button>
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
