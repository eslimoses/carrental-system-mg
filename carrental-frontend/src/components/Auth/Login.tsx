import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Floating circles animation variants
  const circleVariants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      x: [0, 10, 0],
      transition: {
        duration: 4 + i,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      
      // Artificial delay for smooth transition before unmounting
      setTimeout(() => {
        // No need to navigate here as useAuth.login already handles it
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          custom={1}
          variants={circleVariants}
          animate="animate"
          className="absolute top-[10%] left-[10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" 
        />
        <motion.div 
          custom={2}
          variants={circleVariants}
          animate="animate"
          className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Branding Area */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6"
          >
            <img
              src="https://st3.depositphotos.com/22052918/32067/v/450/depositphotos_320674452-stock-illustration-letter-mg-slice-colorful-logo.jpg"
              alt="MotoGlide"
              className="h-12 w-12 rounded-xl object-cover mix-blend-screen"
            />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Welcome <span className="text-blue-500">Back</span>
          </h1>
          <p className="text-slate-400 font-medium">Access your MotoGlide premium experience</p>
        </div>

        {/* glassmorphism Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-800/50">
          <AnimatePresence mode='wait'>
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Login Successful</h3>
                <p className="text-slate-400">Taking you to your dashboard...</p>
              </motion.div>
            ) : (
              <motion.div key="form">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Styled Email Input */}
                  <div className="group">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <FiMail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                        className="w-full bg-slate-950/50 text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Styled Password Input */}
                  <div className="group">
                    <div className="flex justify-between px-1 mb-2">
                      <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Password</label>
                      <button type="button" className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-tighter">Forgot?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                        <FiLock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 text-white pl-12 pr-12 py-4 rounded-2xl border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-slate-700 disabled:to-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        SIGN IN
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                  <p className="text-slate-500 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-white hover:text-blue-500 font-bold transition-colors">
                      Register Now
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none">
        MotoGlide Car Rental Ecosystem • 2026
      </div>
    </div>
  );
};

export default Login;
