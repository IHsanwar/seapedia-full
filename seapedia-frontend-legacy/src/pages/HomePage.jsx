import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  ShoppingBag, Truck, Store, ShieldCheck,
  Star, SendHorizonal, User, Package, CreditCard, MapPin, Loader2,
} from 'lucide-react';
import { reviewsAPI } from '../api/reviews';
import { useAuth } from '../contexts/AuthContext';

// ─── Public Application Review ───────────────────────────────────────────────

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none cursor-pointer"
          aria-label={`${star} star`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [name, setName]       = useState('');
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    reviewsAPI.getReviews()
      .then((res) => {
        setReviews(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
      })
      .finally(() => {
        setLoadingReviews(false);
      });
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name    = 'Nama wajib diisi';
    if (!rating)         e.rating  = 'Rating bintang wajib dipilih';
    if (!comment.trim()) e.comment = 'Komentar wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(false);
    setSubmitting(true);
    try {
      const payload = {
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim(),
      };
      const res = await reviewsAPI.submitReview(payload);
      if (res.success || res.data) {
        const newReview = res.data || res;
        setReviews((prev) => [newReview, ...prev]);
        setRating(0);
        setComment('');
        if (!user) setName('');
        setErrors({});
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrors({ api: err.response?.data?.message || 'Gagal mengirim ulasan. Coba lagi nanti.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ulasan Pengguna</h2>
          <p className="text-muted-foreground">
            Ceritakan pengalamanmu menggunakan SEAPEDIA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Tinggalkan Ulasan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.api && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {errors.api}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nama</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    disabled={!!user}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-75 ${
                      errors.name ? 'border-destructive' : 'border-input'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Komentar</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Bagaimana pengalamanmu menggunakan SEAPEDIA?"
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors.comment ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SendHorizonal className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Mengirim…' : 'Kirim Ulasan'}
              </Button>

              {submitted && (
                <p className="text-sm text-center text-green-600 font-medium">
                  ✅ Terima kasih atas ulasanmu!
                </p>
              )}
            </form>
          </div>

          {/* Review list */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loadingReviews ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Memuat ulasan…</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border rounded-xl border-dashed bg-background">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada ulasan. Jadilah yang pertama!</p>
              </div>
            ) : (
              reviews.map((r) => (
                <Card key={r.id} className="shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold">
                          {(r.reviewer_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-none">{r.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s}
                            className={`h-3.5 w-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                      {r.comment}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-2">
            <ShoppingBag className="h-4 w-4" />
            Platform Multi-Commerce Indonesia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Satu Platform,{' '}
            <span className="text-primary">Semua Transaksi</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SEAPEDIA menghubungkan Buyer, Seller, dan Driver dalam satu ekosistem commerce yang mendukung pembayaran, pengiriman, dan manajemen toko secara terpadu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button size="lg" asChild>
              <Link to="/products">Mulai Belanja</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">Bergabung Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Roles / How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">Siapa yang Bisa Bergabung?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Satu akun, banyak peran. Kamu bisa berjalan sebagai Buyer, Seller, atau Driver — atau ketiganya sekaligus.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShoppingBag, title: 'Buyer', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
                desc: 'Atur wallet, alamat pengiriman, keranjang, checkout, dan riwayat pesanan.',
              },
              {
                icon: Store, title: 'Seller', color: 'text-green-600 bg-green-50 dark:bg-green-950',
                desc: 'Buat toko, kelola produk, proses pesanan masuk, dan pantau pendapatan.',
              },
              {
                icon: Truck, title: 'Driver', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
                desc: 'Cari job pengiriman, ambil job, selesaikan pengiriman, dan lihat penghasilan.',
              },
              {
                icon: ShieldCheck, title: 'Tamu', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
                desc: 'Monitor marketplace, kelola resource, dan akses halaman administrasi.',
              },
            ].map(({ icon: Icon, title, color, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow border">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mt-3">{title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Value props */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa SEAPEDIA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CreditCard, title: 'Pembayaran Terintegrasi',
                desc: 'Wallet terintegrasi untuk Buyer, Seller, dan Driver dalam satu platform.' },
              { icon: Package, title: 'Manajemen Produk',
                desc: 'Seller dapat dengan mudah mengelola stok, harga, dan status produk.' },
              { icon: MapPin, title: 'Pengiriman Real-time',
                desc: 'Driver mengambil job, melacak rute, dan mengkonfirmasi selesai langsung dari aplikasi.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl h-fit shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products placeholder */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold">Produk Terbaru</h2>
            <Button variant="ghost" asChild>
              <Link to="/products">Lihat Semua →</Link>
            </Button>
          </div>
          <div className="bg-muted/40 rounded-xl border border-dashed p-16 text-center">
            <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-muted-foreground">Produk Segera Hadir</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Seller sedang menyiapkan produk. Daftar sekarang untuk jadi yang pertama berbelanja.
            </p>
          </div>
        </div>
      </section>

      {/* Public Application Reviews */}
      <ReviewSection />
    </div>
  );
}
