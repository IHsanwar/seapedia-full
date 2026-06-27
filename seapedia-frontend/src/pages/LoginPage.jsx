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

// Backend menerima email ATAU username di field `login`
const loginSchema = z.object({
  login:    z.string().min(1, { message: 'Email atau username wajib diisi' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

export default function LoginPage() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      toast.success('Login berhasil!');

      // Jika user adalah buyer, langsung ke dashboard. Jika multi-role, pilih role dulu.
      if (res?.roles?.includes('buyer')) {
        navigate('/dashboard');
      } else if (res?.roles?.length > 1) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login gagal. Periksa kembali email dan password kamu.'
      );
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Selamat datang kembali</CardTitle>
        <CardDescription className="text-center">
          Masukkan email atau username dan password kamu
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* login field (email or username) */}
          <div className="space-y-2">
            <Label htmlFor="login">Email atau Username</Label>
            <Input
              id="login"
              type="text"
              placeholder="name@example.com"
              autoComplete="username"
              {...register('login')}
              className={errors.login ? 'border-destructive' : ''}
            />
            {errors.login && (
              <p className="text-sm text-destructive">{errors.login.message}</p>
            )}
          </div>

          {/* password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-center text-muted-foreground w-full">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
