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
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm bg-white border border-border shadow-sm rounded-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto bg-[#ba1a1a]/10 p-4 rounded-full w-fit">
            <LogOut className="h-8 w-8 text-[#ba1a1a]" />
          </div>
          <CardTitle className="text-2xl text-[#003f87]">Keluar dari Akun?</CardTitle>
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
            className="w-full bg-[#ba1a1a] hover:bg-[#a01515]"
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

          <Button variant="outline" className="w-full border-[#003f87] text-[#003f87]" onClick={handleCancel} disabled={loading}>
            Batal
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#003f87] transition-colors"
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
