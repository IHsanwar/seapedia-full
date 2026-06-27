import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { driverAPI } from '../../api/driver';
import { authAPI } from '../../api/auth';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Truck, Package, Wallet, Loader2, AlertTriangle,
  MapPin, Clock, CheckCircle, ExternalLink, TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';

function HistoryCard({ job }) {
  const order = job.order;
  const store = order?.store;
  const address = order?.address;

  const isCompleted = job.status === 'completed';

  return (
    <Card className="bg-white border border-border shadow-sm rounded-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs bg-[#722b00]/10 text-[#722b00]">
                #{order?.order_number}
              </Badge>
              <Badge
                className={`text-xs ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}
              >
                {isCompleted ? 'Selesai' : 'Dibatalkan'}
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              {store?.store_name || 'Unknown Store'}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {order?.items?.length || 0} item(s) • <span className="text-[#006b5f] font-bold">Rp {Number(job.fee).toLocaleString('id-ID')}</span> delivery fee
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[#722b00] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Delivery Address</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {address?.address_line_1}, {address?.city}, {address?.province}
              </p>
            </div>
          </div>

          {job.taken_at && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Diambil pada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.taken_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {job.completed_at && (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-[#006b5f] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-[#006b5f]">Selesai pada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.completed_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await driverAPI.getMyJobs(page);
      const jobsData = res?.data?.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      if (res?.data) {
        setPagination({
          current_page: res.data.current_page || 1,
          last_page: res.data.last_page || 1,
          per_page: res.data.per_page || 10,
          total: res.data.total || 0
        });
      }

      // Hitung completed jobs dari halaman saat ini untuk tampilan
      const completed = jobsData.filter(j => j.status === 'completed');
      setCompletedJobs(completed.length);
      // Catatan: earnings diambil dari dashboard API (total semua waktu),
      // bukan dihitung dari halaman ini saja
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat riwayat');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil total earnings dari endpoint dashboard (akurat untuk semua halaman)
  useEffect(() => {
    authAPI.getDashboard()
      .then((res) => {
        const data = res?.data?.data ?? res?.data ?? res;
        const dashEarnings = data?.financial_summaries?.driver_earnings ?? 0;
        setEarnings(dashEarnings);
      })
      .catch(() => {
        // Fallback: earnings tetap 0 jika gagal
      });
  }, []);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3 bg-[#f8f9ff]">
        <Loader2 className="h-8 w-8 animate-spin text-[#722b00]" />
        <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-[#f8f9ff] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#722b00]">
            <Clock className="h-6 w-6 text-[#722b00]" />
            Riwayat Pengiriman
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total} total job pengiriman
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/driver/jobs')} className="border-[#006b5f] text-[#006b5f] rounded-sm">
            <Truck className="h-4 w-4 mr-1" /> Cari Job Baru
          </Button>
          <Button variant="outline" onClick={() => navigate('/driver/my-jobs')} className="border-[#006b5f] text-[#006b5f] rounded-sm">
            <Package className="h-4 w-4 mr-1" /> Job Aktif
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-white border-border shadow-sm rounded-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="bg-[#722b00]/10 p-3 rounded-sm shrink-0">
                <Wallet className="h-5 w-5 text-[#722b00]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total Penghasilan</p>
                <p className="text-lg font-bold text-[#006b5f]">Rp {earnings.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm rounded-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="bg-[#006b5f]/10 p-3 rounded-sm shrink-0">
                <CheckCircle className="h-5 w-5 text-[#006b5f]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Job Selesai</p>
                <p className="text-lg font-bold text-[#722b00]">{completedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed border-border bg-white shadow-sm rounded-sm">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              Belum ada riwayat pengiriman.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/driver/jobs')} className="border-[#006b5f] text-[#006b5f] rounded-sm">
              <Truck className="h-4 w-4 mr-1" /> Cari Job Baru
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <HistoryCard
              key={job.id}
              job={job}
            />
          ))}
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page === 1}
            onClick={() => fetchJobs(pagination.current_page - 1)}
            className="rounded-sm"
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {pagination.current_page} dari {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => fetchJobs(pagination.current_page + 1)}
            className="rounded-sm"
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
