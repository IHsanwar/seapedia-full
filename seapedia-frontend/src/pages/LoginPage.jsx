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

// Backend accepts email OR username in the `login` field
const loginSchema = z.object({
  login:    z.string().min(1, { message: 'Email or username is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
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
      toast.success('Login successful!');

      // If user owns more than 1 role → pick a role first
      if (res?.roles?.length > 1) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email (or username) and password to sign in
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* login field (email or username) */}
          <div className="space-y-2">
            <Label htmlFor="login">Email or Username</Label>
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
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-center text-muted-foreground w-full">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
