import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { driverAPI } from '../../api/driver';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';
import {
  Truck, Package, Wallet, Loader2, AlertTriangle, 
  MapPin, Clock, CheckCircle, ExternalLink, Navigation
} from 'lucide-react';
import { toast } from 'react-toastify';

function MyJobCard({ job, onComplete, completing }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const order = job.order;
  const store = order?.store;
  const address = order?.address;

  const isInProgress = job.status === 'in_progress';
  const isCompleted = job.status === 'completed';

  return (
    <Card className="border transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                #{order?.order_number}
              </Badge>
              <Badge 
                variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"} 
                className="text-xs"
              >
                {isCompleted ? 'Selesai' : isInProgress ? 'Sedang Dikirim' : 'Menunggu'}
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">
              {store?.store_name || 'Unknown Store'}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {order?.items?.length || 0} item(s) • Rp {Number(job.fee).toLocaleString('id-ID')} delivery fee
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Delivery Address</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {address?.address_line_1}, {address?.city}, {address?.province}
              </p>
            </div>
          </div>
          
          {job.taken_at && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Diambil pada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.taken_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {job.completed_at && (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-600">Selesai pada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(job.completed_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
        </div>

        {isInProgress && (
          <div className="flex gap-2 pt-2">
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" disabled={completing}>
                  {completing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Selesaikan Pengiriman
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Selesaikan Pengiriman</DialogTitle>
                  <DialogDescription>
                    Apakah kamu yakin ingin menyelesaikan pengiriman untuk pesanan <strong>#{order?.order_number}</strong>?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
                  <Button
                    disabled={completing}
                    onClick={async () => {
                      await onComplete(job.id);
                      setConfirmOpen(false);
                    }}
                  >
                    {completing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Ya, Selesaikan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DriverMyJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat job kamu');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleCompleteJob = async (deliveryId) => {
    setCompleting(deliveryId);
    try {
      await driverAPI.completeJob(deliveryId);
      toast.success('Pengiriman berhasil diselesaikan!');
      await fetchJobs(pagination.current_page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyelesaikan pengiriman');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat job kamu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-600" />
            Job Saya
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination.total} job pengiriman yang sedang kamu kerjakan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/driver/jobs')}>
            <Truck className="h-4 w-4 mr-1" /> Cari Job Baru
          </Button>
          <Button variant="outline" onClick={() => navigate('/driver/history')}>
            <Clock className="h-4 w-4 mr-1" /> Riwayat
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              Kamu belum memiliki job pengiriman aktif.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/driver/jobs')}>
              <Truck className="h-4 w-4 mr-1" /> Cari Job Baru
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <MyJobCard
              key={job.id}
              job={job}
              onComplete={handleCompleteJob}
              completing={completing === job.id}
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
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => fetchJobs(pagination.current_page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
