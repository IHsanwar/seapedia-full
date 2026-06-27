import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LogOut, Loader2, ShoppingBag } from 'lucide-react';

export default function LogoutPage() {
  const { user, logout, activeRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  const handleCancel = () => {
    navigate(-1); // go back
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
            <LogOut className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Keluar dari Akun?</CardTitle>
          <CardDescription>
            {user ? (
              <>
                Kamu sedang login sebagai{' '}
                <span className="font-semibold text-foreground">{user.name}</span>
                {activeRole && activeRole !== 'none' && (
                  <> (role: <span className="capitalize font-semibold text-foreground">{activeRole}</span>)</>
                )}
                . Token sesi akan dicabut.
              </>
            ) : (
              'Apakah kamu yakin ingin keluar?'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Keluar…' : 'Ya, Keluar'}
          </Button>

          <Button variant="outline" className="w-full" onClick={handleCancel} disabled={loading}>
            Batal
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
