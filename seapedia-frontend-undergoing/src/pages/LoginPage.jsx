import { useState } from 'react';
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
  Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight,
  ShoppingBag, Truck, Shield, Headphones
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().default(false)
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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

  const onSubmit = async (data) => {
    try {
      const res = await login({
        login: data.email,
        password: data.password
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
      toast.error(
        err.response?.data?.message || 
        'Login gagal. Periksa kembali email dan password Anda.'
      );
    }
  };

  const features = [
    { icon: ShoppingBag, title: "Jutaan Produk", desc: "Pilihan produk terlengkap" },
    { icon: Truck, title: "Pengiriman Cepat", desc: "Sampai dalam 1-3 hari" },
    { icon: Shield, title: "100% Aman", desc: "Garansi uang kembali" },
    { icon: Headphones, title: "24/7 Support", desc: "Bantuan kapan saja" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/90 to-blue-800/90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-[#0066FF]" />
            </div>
            <span className="text-2xl font-bold">SEAPEDIA</span>
          </div>

          {/* Middle - Quote */}
          <div className="max-w-md">
            <blockquote className="text-2xl font-light italic mb-6 leading-relaxed">
              "Platform e-commerce terbaik untuk berbelanja online di Indonesia."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                S
              </div>
              <div>
                <p className="font-semibold">Seapedia Team</p>
                <p className="text-sm text-white/70">E-Commerce Platform</p>
              </div>
            </div>
          </div>

          {/* Bottom - Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="font-semibold text-sm">{feature.title}</p>
                    <p className="text-xs text-white/70">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
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
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...register('email')}
                    className={`pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau masuk dengan</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

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
