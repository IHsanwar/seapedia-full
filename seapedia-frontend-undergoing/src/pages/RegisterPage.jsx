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
  ShoppingBag, Truck, Shield, Headphones, Phone,
  CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon terlalu panjang'),
  password: z.string().min(8, 'Password minimal 8 karakter').regex(/[A-Z]/, 'Password harus mengandung huruf besar').regex(/[0-9]/, 'Password harus mengandung angka'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Anda harus menyetujui syarat dan ketentuan'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword']
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const res = await authRegister({
        name: data.name,
        email: data.email,
        username: data.email.split('@')[0],
        phone: data.phone,
        password: data.password,
        password_confirmation: data.confirmPassword
      });
      
      toast.success('Akun berhasil dibuat! Selamat datang di SEAPEDIA.');
      
      if (res?.roles?.includes('buyer')) {
        navigate('/dashboard');
      } else if (res?.roles?.length > 1) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const firstError = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstError ?? msg ?? 'Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  const features = [
    { icon: ShoppingBag, title: "Jutaan Produk", desc: "Pilihan produk terlengkap" },
    { icon: Truck, title: "Pengiriman Cepat", desc: "Sampai dalam 1-3 hari" },
    { icon: Shield, title: "100% Aman", desc: "Garansi uang kembali" },
    { icon: Headphones, title: "24/7 Support", desc: "Bantuan kapan saja" }
  ];

  const passwordRequirements = [
    { label: 'Minimal 8 karakter', met: password?.length >= 8 },
    { label: 'Mengandung huruf besar', met: /[A-Z]/.test(password || '') },
    { label: 'Mengandung angka', met: /[0-9]/.test(password || '') }
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
              "Bergabung dengan SEAPEDIA dan nikmati pengalaman belanja online terbaik."
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

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-cyan-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SEAPEDIA</span>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
              <p className="text-gray-500 text-sm">Daftar gratis dan nikmati kemudahan berbelanja</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-[#0066FF]' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {currentStep === 1 ? (
                <>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Budi Santoso"
                        {...register('name')}
                        className={`pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

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

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="081234567890"
                        {...register('phone')}
                        className={`pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>

                  {/* Next Button */}
                  <Button
                    type="button"
                    onClick={async () => {
                      const valid = await trigger(['name', 'email', 'phone']);
                      if (valid) setCurrentStep(2);
                    }}
                    className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Lanjutkan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter"
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
                    {/* Password requirements */}
                    <div className="space-y-1 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={req.met ? 'text-green-600' : 'text-gray-400'}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        {...register('confirmPassword')}
                        className={`pl-10 pr-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                  </div>

              {/* Terms & Conditions */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    className="mt-1 border-gray-300 data-[state=checked]:bg-[#0066FF] data-[state=checked]:border-[#0066FF]"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    Saya menyetujui{' '}
                    <Link to="/terms" className="text-[#0066FF] hover:underline">Syarat dan Ketentuan</Link>
                    {' '}serta{' '}
                    <Link to="/privacy" className="text-[#0066FF] hover:underline">Kebijakan Privasi</Link>
                    {' '}SEAPEDIA
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-xs ml-7">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="w-1/3 h-12 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Kembali
                </Button>
                <Button
                  type="submit"
                  className="w-2/3 h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang
                      <CheckCircle className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6 text-sm">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#0066FF] font-semibold hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </form>
      </div>
    </div>
  </div>
</div>
);
}

const features = [
  { icon: ShoppingBag, title: "Jutaan Produk", desc: "Pilihan produk terlengkap" },
  { icon: Truck, title: "Pengiriman Cepat", desc: "Sampai dalam 1-3 hari" },
  { icon: Shield, title: "100% Aman", desc: "Garansi uang kembali" },
  { icon: Headphones, title: "24/7 Support", desc: "Bantuan kapan saja" }
];

const passwordRequirements = [
  { label: 'Minimal 8 karakter', met: false },
  { label: 'Mengandung huruf besar', met: false },
  { label: 'Mengandung angka', met: false }
];
