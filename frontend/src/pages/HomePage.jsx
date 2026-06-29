import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/products';
import { reviewsAPI } from '../api/reviews';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import {
  Search, ArrowRight, Star, ShoppingCart, Store,
  Truck, ShieldCheck, Users, Headphones, Package,
  Smartphone, Shirt, Home as HomeIcon, Sparkles,
  Dumbbell, Utensils, BookOpen, Car, Wrench, MoreHorizontal,
  Bike, Shield, TrendingUp, Send, Loader2, MessageSquarePlus
} from 'lucide-react';

const categories = [
  { id: 1, name: "Elektronik", icon: Smartphone },
  { id: 2, name: "Fashion", icon: Shirt },
  { id: 3, name: "Rumah Tangga", icon: HomeIcon },
  { id: 4, name: "Kecantikan", icon: Sparkles },
  { id: 5, name: "Olahraga", icon: Dumbbell },
  { id: 6, name: "Makanan", icon: Utensils },
  { id: 7, name: "Buku", icon: BookOpen },
  { id: 8, name: "Otomotif", icon: Car },
  { id: 9, name: "Perkakas", icon: Wrench },
  { id: 10, name: "Lainnya", icon: MoreHorizontal },
];

const roleFeatures = [
  {
    icon: ShoppingCart,
    title: "Buyer",
    desc: "Jelajahi produk, checkout mudah, lacak pesanan, dan kelola dompet digital dalam satu platform.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Store,
    title: "Seller",
    desc: "Kelola toko, upload produk, proses pesanan, dan pantau laporan penjualan secara real-time.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Bike,
    title: "Driver",
    desc: "Terima job pengiriman, lacak rute, dan terima penghasilan dengan sistem yang transparan.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Admin",
    desc: "Monitor marketplace, kelola voucher & promosi, verifikasi toko, dan atur pengguna.",
    color: "text-foreground",
    bg: "bg-muted",
  },
];

const advantages = [
  { icon: ShieldCheck, title: "Transaksi Aman", desc: "Sistem pembayaran wallet terjamin keamanan" },
  { icon: Truck, title: "Pengiriman Terintegrasi", desc: "Driver dedicated untuk setiap pengiriman" },
  { icon: TrendingUp, title: "Laporan Real-time", desc: "Dashboard analytics untuk seller & admin" },
  { icon: Headphones, title: "Dukungan 24/7", desc: "Tim support siap membantu kapan saja" },
];

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.url_slug || product.id}`}
      className="group bg-card border border-border rounded-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        {product.thumbnail_image || product.image_url ? (
          <img
            src={product.thumbnail_image || product.image_url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-destructive">Stok Habis</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 truncate">
          {product.store?.store_name || 'Unknown Store'}
        </p>
        <p className="font-bold text-primary mt-2 text-base">
          {formatPrice(product.price)}
        </p>
        {product.stock > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Stok: {product.stock}
          </p>
        )}
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {(review.reviewer_name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">{review.reviewer_name || 'Anonim'}</h4>
          <div className="flex gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        "{review.comment}"
      </p>
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5 mt-2" />
    </div>
  );
}

function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-border'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ onSubmitSuccess }) {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reviewerName.trim()) {
      setError('Nama harus diisi');
      return;
    }
    if (rating === 0) {
      setError('Pilih rating');
      return;
    }
    if (!comment.trim()) {
      setError('Komentar harus diisi');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.submitReview({
        reviewer_name: reviewerName.trim(),
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
      setReviewerName('');
      setRating(0);
      setComment('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim review');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card border border-border rounded-sm p-6 text-center">
        <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-full mx-auto mb-3">
          <Star className="h-6 w-6 text-secondary fill-secondary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Terima Kasih!</h3>
        <p className="text-sm text-muted-foreground mb-4">Review Anda berhasil dikirim.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSuccess(false)}
          className="rounded-sm"
        >
          Tulis Review Lagi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageSquarePlus className="h-5 w-5 text-primary" />
        Tulis Review
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reviewer-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nama
          </Label>
          <Input
            id="reviewer-name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Masukkan nama Anda"
            className="rounded-sm"
            maxLength={100}
            disabled={submitting}
          />
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-medium text-foreground">
            Rating
          </Label>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div>
          <Label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-foreground">
            Komentar
          </Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalaman Anda tentang SEAPEDIA..."
            className="rounded-sm min-h-[80px]"
            rows={3}
            disabled={submitting}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Kirim Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewsAPI.getReviews();
      const items = Array.isArray(res?.data) ? res.data : [];
      setReviews(items.slice(0, 4));
    } catch {
      // reviews are optional, fail silently
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getProducts({ limit: 8 });
        const items = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setProducts(items.slice(0, 8));
      } catch (err) {
        setProductsError('Gagal memuat produk');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative bg-[#003f87] text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-[24px] py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-primary-foreground/20 text-primary-foreground text-xs font-semibold tracking-wider uppercase mb-6">
              Multi-Commerce Platform
            </span>
            <h1 className="text-3xl md:text-[40px] font-bold leading-tight mb-4">
              Platform E-Commerce Terpadu untuk Buyer, Seller & Driver
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-8 leading-relaxed">
              SEAPEDIA menyatukan seluruh ekosistem commerce dalam satu aplikasi.
              Belanja, jualan, dan kirim pesanan tanpa berpindah platform.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk di SEAPEDIA..."
                className="w-full h-12 pl-12 pr-28 bg-background text-foreground border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <Link
                to={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-sm hover:bg-secondary/90 transition-colors flex items-center"
              >
                Cari
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-primary-foreground/20">
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-primary-foreground/70 mt-0.5">User Roles</p>
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-primary-foreground/70 mt-0.5">Ekosistem</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-primary-foreground/70 mt-0.5">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* ─── Featured Products ─────────────────────────────────────────────── */}
      <section className="bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[24px] py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Produk Unggulan</h2>
              <p className="text-sm text-muted-foreground mt-1">Produk terbaru dari toko terpercaya</p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsError ? (
            <div className="bg-card border border-border p-8 rounded-sm text-center">
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{productsError}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-sm text-center">
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Belum Ada Produk</h3>
              <p className="text-sm text-muted-foreground">Produk akan muncul setelah seller menambahkan produk.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Multi-Role System ─────────────────────────────────────────────── */}
      <section className="bg-background">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[24px] py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Satu Platform, Banyak Peran</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              SEAPEDIA menyatukan seluruh partisipan commerce dalam ekosistem terintegrasi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {roleFeatures.map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-sm p-6"
                >
                  <div className={`w-12 h-12 ${role.bg} flex items-center justify-center rounded-sm mb-4`}>
                    <Icon className={`h-6 w-6 ${role.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              <Link to="/register">
                Bergabung Sekarang <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Marketplace Advantages ────────────────────────────────────────── */}
      <section className="bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[24px] py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Keunggulan Platform</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Dirancang untuk pengalaman commerce yang profesional dan terpercaya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {advantages.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-card border border-border rounded-sm p-5">
                  <Icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Reviews / Testimonials ────────────────────────────────────────── */}
      <section className="bg-background">
        <div className="max-w-[1280px] mx-auto px-6 md:px-[24px] py-12">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Testimoni Pengguna</h2>
            <p className="text-sm text-muted-foreground mt-1">Apa kata mereka tentang SEAPEDIA</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm onSubmitSuccess={fetchReviews} />
            </div>

            {/* Review List */}
            <div className="lg:col-span-2">
              {reviewsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <ReviewCardSkeleton key={i} />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-card border border-border p-8 rounded-sm text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Belum Ada Testimoni</h3>
                  <p className="text-sm text-muted-foreground">Jadilah yang pertama memberikan review!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────────────── */}
      <section className="relative bg-[#003f87] text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-[24px] py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Mulai Berjualan atau Belanja di SEAPEDIA
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Daftar gratis dan nikmati ekosistem commerce terpadu dengan pembayaran wallet, pengiriman terintegrasi, dan dashboard profesional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-sm h-11 px-8 font-semibold">
              <Link to="/register">Daftar Sekarang</Link>
            </Button>
            <Button asChild variant="outline" className="bg-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-sm h-11 px-8 font-semibold">
              <Link to="/products">Jelajahi Produk</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
