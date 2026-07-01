import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Loader2, Eye, EyeOff, Lock, User, ArrowRight,
  ShoppingBag, Truck, Shield, Headphones
} from 'lucide-react';
import { toast } from 'react-toastify';
import AuthSidebar from '../components/layout/AuthSidebar';
import { Turnstile } from '@marsidev/react-turnstile';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  login: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().default(false)
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  const rememberMe = watch('rememberMe');
  const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const onSubmit = async (data) => {
    if (!turnstileToken) {
      toast.error('Silakan selesaikan verifikasi captcha terlebih dahulu.');
      return;
    }
    try {
      const res = await login({
        login: data.login,
        password: data.password,
        rememberMe: data.rememberMe,
        'cf-turnstile-response': turnstileToken,
      });
      
      toast.success('Login berhasil! Selamat datang kembali.');
      
      if (res?.roles?.includes('buyer')) {
        navigate('/dashboard');
      } else if (res?.roles?.length > 1) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      toast.error(
        err.response?.data?.message || 
        'Login gagal. Periksa kembali username/email dan password Anda.'
      );
    }
  };

  return ( 
    <div className="fixed inset-0 bg-gray-50 flex">
      {/* Left Side */}
      <AuthSidebar quote="Platform e-commerce terbaik untuk berbelanja online di Indonesia." />
    {/* Right Side - selalu ambil sisa ruang */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-cyan-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SEAPEDIA</span>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang Kembali!</h1>
              <p className="text-gray-500 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email atau Username */}
              <div className="space-y-2">
                <Label htmlFor="login" className="text-gray-700">Email atau Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="login"
                    type="text"
                    placeholder="email@contoh.com atau username"
                    {...register('login')}
                    className={`pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.login ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.login && <p className="text-red-500 text-xs">{errors.login.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`pl-10 pr-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>
              {/* Turnstile captcha */}
              <div className="mt-4">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setValue('rememberMe', checked)}
                    className="border-gray-300 data-[state=checked]:bg-[#0066FF] data-[state=checked]:border-[#0066FF]"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                    Ingat saya
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-[#0066FF] hover:underline">
                  Lupa password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <p className="text-center text-gray-600 mt-6 text-sm">
              Belum punya akun?{' '}
              <Link to="/register" className="text-[#0066FF] font-semibold hover:underline">
                Daftar sekarang
              </Link>
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
