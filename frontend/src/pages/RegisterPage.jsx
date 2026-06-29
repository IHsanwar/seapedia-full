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
  CheckCircle, ChevronLeft, ChevronRight, AtSign
} from 'lucide-react';
import { toast } from 'react-toastify';
import AuthSidebar from '../components/layout/AuthSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
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
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
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
        username: data.username,
        email: data.email,
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

  const passwordRequirements = [
    { label: 'Minimal 8 karakter', met: password?.length >= 8 },
    { label: 'Mengandung huruf besar', met: /[A-Z]/.test(password || '') },
    { label: 'Mengandung angka', met: /[0-9]/.test(password || '') }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 flex"> 
      {/* Left Side */}
      <AuthSidebar quote="Bergabung dengan SEAPEDIA dan nikmati pengalaman belanja online terbaik." />

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

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="username_anda"
                        {...register('username')}
                        className={`pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 rounded-xl ${errors.username ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
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
                      const valid = await trigger(['name', 'username', 'email', 'phone']);
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
                    checked={watch('acceptTerms')}
                    onCheckedChange={(checked) => setValue('acceptTerms', checked, { shouldValidate: true })}
                    className="mt-1 border-gray-300 data-[state=checked]:bg-[#0066FF] data-[state=checked]:border-[#0066FF]"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                    Saya menyetujui{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#0066FF] hover:underline bg-transparent border-none p-0 inline font-normal"
                    >
                      Syarat dan Ketentuan
                    </button>
                    {' '}serta{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#0066FF] hover:underline bg-transparent border-none p-0 inline font-normal"
                    >
                      Kebijakan Privasi
                    </button>
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

  {/* Modal Syarat & Ketentuan */}
  <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="flex flex-col items-center text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Shield className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>
        <DialogTitle className="text-xl">Syarat & Ketentuan Simulasi</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-center text-base py-4 text-foreground/80 leading-relaxed">
        Dengan mendaftar di <strong>SEAPEDIA</strong>, Anda memahami dan menyetujui bahwa:
        <br /><br />
        1. Platform ini sepenuhnya merupakan <strong>aplikasi demonstrasi / simulasi</strong>.
        <br />
        2. Tidak ada transaksi keuangan riil, pengiriman barang nyata, atau aktivitas komersial asli yang dilakukan di platform ini.
        <br />
        3. Seluruh data yang diisi (termasuk saldo dompet simulasi) bersifat fiktif dan hanya digunakan untuk keperluan pengujian dan demonstrasi sistem.
      </DialogDescription>
      <DialogFooter className="sm:justify-center">
        <Button onClick={() => setShowTermsModal(false)} className="w-full sm:w-auto bg-[#0066FF] hover:bg-[#0052CC]">
          Saya Mengerti & Setuju
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
);
}

