import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from '../components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

// Sesuai dengan validasi RegisterRequest.php
const registerSchema = z
  .object({
    name:                  z.string().min(2, 'Nama minimal 2 karakter').max(100),
    username:              z.string().min(3, 'Username minimal 3 karakter').max(50)
                            .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
    email:                 z.email({ message: 'Alamat email tidak valid' }),
    phone:                 z.string().max(20).optional().or(z.literal('')),
    password:              z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Konfirmasi password wajib diisi'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
  });

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate  = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await authRegister(data);
      toast.success('Akun berhasil dibuat! Selamat datang di SEAPEDIA.');
      // Registrasi otomatis memberikan role buyer → satu role → langsung ke dashboard
      if (res?.roles?.includes('buyer')) {
        navigate('/dashboard');
      } else if (res?.roles?.length > 1) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      // Laravel mengembalikan error validasi sebagai { errors: { field: [...] } }
      const firstError = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstError ?? msg ?? 'Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Buat Akun Baru</CardTitle>
        <CardDescription className="text-center">
          Isi data kamu untuk bergabung dengan SEAPEDIA
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nama Lengkap</Label>
            <Input id="reg-name" placeholder="Budi Santoso" {...register('name')}
              className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input id="reg-username" placeholder="johndoe123" autoComplete="username"
              {...register('username')} className={errors.username ? 'border-destructive' : ''} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" placeholder="name@example.com"
              autoComplete="email" {...register('email')}
              className={errors.email ? 'border-destructive' : ''} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Phone (optional) */}
          <div className="space-y-2">
            <Label htmlFor="reg-phone">
              Nomor Telepon <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Input id="reg-phone" type="tel" placeholder="+62 812 3456 7890"
              {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input id="reg-password" type={showPw ? 'text' : 'password'}
                autoComplete="new-password" {...register('password')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'} />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Konfirmasi Password</Label>
            <Input id="reg-confirm" type={showPw ? 'text' : 'password'}
              autoComplete="new-password" {...register('password_confirmation')}
              className={errors.password_confirmation ? 'border-destructive' : ''} />
            {errors.password_confirmation && (
              <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buat Akun
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-center text-muted-foreground w-full">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
