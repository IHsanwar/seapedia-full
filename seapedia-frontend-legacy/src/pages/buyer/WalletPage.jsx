import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { walletAPI } from '../../api/wallet';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Wallet, ArrowLeft, Plus, Loader2, ArrowUpRight,
  ArrowDownLeft, Clock, TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupModal, setTopupModal] = useState(false);
  const [topupForm, setTopupForm] = useState({ amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions()
      ]);
      setWallet(walletRes?.data);
      setTransactions(transRes?.data || []);
    } catch (err) {
      toast.error('Gagal memuat data wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amount = parseFloat(topupForm.amount);
      if (isNaN(amount) || amount < 1000) {
        toast.error('Minimal top up Rp 1.000');
        setSubmitting(false);
        return;
      }

      await walletAPI.topup({
        amount,
        description: topupForm.description
      });
      
      toast.success('Top up berhasil!');
      setTopupModal(false);
      setTopupForm({ amount: '', description: '' });
      fetchWalletData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal top up');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
        return 'text-green-600';
      case 'payment':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'income':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        {
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        }
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/buyer/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke dashboard
      </Link>

      <div className="space-y-6">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-3 rounded-xl">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Wallet Saya</CardTitle>
                  <CardDescription>Saldo dan riwayat transaksi</CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setTopupModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">Saldo Aktif</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                Rp {(wallet) ? parseFloat(wallet.balance).toLocaleString('id-ID') : '0'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>Daftar semua transaksi wallet</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'Transaksi'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(transaction.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${getTransactionColor(transaction.type)}`}>
                      <p className="font-semibold">
                        {transaction.type === 'payment' ? '-' : '+'}
                        Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Up Modal */}
      {topupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Top Up Wallet</CardTitle>
              <CardDescription>Masukkan jumlah top up</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTopup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={topupForm.amount}
                    onChange={(e) => setTopupForm({...topupForm, amount: e.target.value})}
                    min="1000"
                    max="10000000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimal Rp 1.000, maksimal Rp 10.000.000
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Input
                    id="description"
                    placeholder="Contoh: Top up untuk belanja"
                    value={topupForm.description}
                    onChange={(e) => setTopupForm({...topupForm, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setTopupModal(false)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Top Up
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
