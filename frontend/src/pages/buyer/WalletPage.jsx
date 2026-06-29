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
        return <ArrowUpRight className="h-4 w-4 text-[#006b5f]" />;
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-[#ba1a1a]" />;
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-[#003f87]" />;
      case 'income':
        return <TrendingUp className="h-4 w-4 text-[#006b5f]" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
        return 'text-[#006b5f]';
      case 'payment':
        return 'text-[#ba1a1a]';
      case 'refund':
        return 'text-[#003f87]';
      case 'income':
        return 'text-[#006b5f]';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/buyer/dashboard" className="inline-flex items-center text-sm text-[#003f87] hover:text-[#006b5f] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke dashboard
        </Link>

        <div className="space-y-6">
          {/* Wallet Balance Card */}
          <Card className="bg-[#003f87] text-white border-0 shadow-lg rounded-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 text-white p-3 rounded-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">Wallet Saya</CardTitle>
                    <CardDescription className="text-white/70">Saldo dan riwayat transaksi</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setTopupModal(true)}
                  className="bg-white text-[#003f87] hover:bg-white/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Top Up
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-sm text-white/70 mb-2">Saldo Aktif</p>
                <p className="text-4xl font-bold text-white">
                  Rp {(wallet) ? parseFloat(wallet.balance).toLocaleString('id-ID') : '0'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-white border border-border shadow-sm rounded-sm">
            <CardHeader>
              <CardTitle className="text-[#003f87]">Riwayat Transaksi</CardTitle>
              <CardDescription>Daftar semua transaksi wallet</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 rounded-sm border border-border bg-white hover:bg-[#f8f9ff] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-sm bg-[#f8f9ff] border border-border">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium capitalize text-[#003f87]">{transaction.type}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.description || 'Transaksi'}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
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
            <Card className="w-full max-w-md bg-white border border-border rounded-sm">
              <CardHeader>
                <CardTitle className="text-[#003f87]">Top Up Wallet</CardTitle>
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
                      className="border-border"
                    />
                    <p className="text-xs text-gray-500">
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
                      className="border-border"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setTopupModal(false)}
                      disabled={submitting}
                      className="flex-1 border-border"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 bg-[#006b5f] hover:bg-[#005a50]"
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
    </div>
  );
}
