import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  ShoppingBag, Truck, Store, ShieldCheck, Star,
  Search, ChevronRight, Heart, ShoppingCart,
  Smartphone, Shirt, Utensils, Heart as HeartIcon,
  Car, Dumbbell, Home, Book, Gamepad2, Sparkles,
  Zap, Clock, Headphones, CreditCard, Package,
  MapPin, Award, Users, TrendingUp, ArrowRight
} from 'lucide-react';

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const categories = [
  { id: 1, name: "Elektronik", icon: Smartphone, color: "bg-blue-500", count: 1240 },
  { id: 2, name: "Fashion", icon: Shirt, color: "bg-pink-500", count: 3500 },
  { id: 3, name: "Makanan", icon: Utensils, color: "bg-orange-500", count: 890 },
  { id: 4, name: "Kesehatan", icon: HeartIcon, color: "bg-red-500", count: 450 },
  { id: 5, name: "Otomotif", icon: Car, color: "bg-purple-500", count: 320 },
  { id: 6, name: "Olahraga", icon: Dumbbell, color: "bg-green-500", count: 670 },
  { id: 7, name: "Rumah Tangga", icon: Home, color: "bg-teal-500", count: 980 },
  { id: 8, name: "Buku", icon: Book, color: "bg-indigo-500", count: 450 },
  { id: 9, name: "Mainan", icon: Gamepad2, color: "bg-yellow-500", count: 560 },
  { id: 10, name: "Kecantikan", icon: Sparkles, color: "bg-rose-500", count: 780 }
];

const flashSaleProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    originalPrice: 20000000,
    salePrice: 18500000,
    discount: 7,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop",
    rating: 4.9,
    sold: 850,
    endTime: "2024-01-31T23:59:59"
  },
  {
    id: 2,
    name: "MacBook Air M3",
    originalPrice: 18000000,
    salePrice: 15900000,
    discount: 12,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    rating: 4.8,
    sold: 420,
    endTime: "2024-01-31T23:59:59"
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    originalPrice: 3500000,
    salePrice: 2800000,
    discount: 20,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
    rating: 4.9,
    sold: 1200,
    endTime: "2024-01-31T23:59:59"
  },
  {
    id: 4,
    name: "iPad Air 5",
    originalPrice: 9500000,
    salePrice: 8200000,
    discount: 14,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    rating: 4.7,
    sold: 680,
    endTime: "2024-01-31T23:59:59"
  }
];

const featuredProducts = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Headphone",
    price: 4800000,
    originalPrice: 5500000,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 320,
    store: "Sony Official",
    location: "Jakarta",
    isWishlist: false
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 16500000,
    originalPrice: 18000000,
    image: "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 520,
    store: "Samsung Store",
    location: "Bandung",
    isWishlist: true
  },
  {
    id: 3,
    name: "Nike Air Jordan 1 High",
    price: 2800000,
    originalPrice: 3500000,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 180,
    store: "Nike Official",
    location: "Surabaya",
    isWishlist: false
  },
  {
    id: 4,
    name: "Dyson V15 Detect Vacuum",
    price: 12000000,
    originalPrice: 13500000,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 95,
    store: "Dyson Official",
    location: "Jakarta",
    isWishlist: false
  },
  {
    id: 5,
    name: "Logitech MX Master 3S",
    price: 1200000,
    originalPrice: 1500000,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 410,
    store: "Logitech Store",
    location: "Jakarta",
    isWishlist: true
  },
  {
    id: 6,
    name: "Herman Miller Aeron Chair",
    price: 18000000,
    originalPrice: 22000000,
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 67,
    store: "Herman Miller",
    location: "Jakarta",
    isWishlist: false
  },
  {
    id: 7,
    name: "Canon EOS R6 Camera",
    price: 28000000,
    originalPrice: 32000000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 43,
    store: "Canon Official",
    location: "Bandung",
    isWishlist: true
  },
  {
    id: 8,
    name: "PlayStation 5 Console",
    price: 8500000,
    originalPrice: 9500000,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 890,
    store: "Sony Official",
    location: "Jakarta",
    isWishlist: false
  }
];

const testimonials = [
  {
    id: 1,
    name: "Budi Santoso",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review: "SEAPEDIA sangat memudahkan saya dalam berbelanja online. Pengiriman cepat dan produk berkualitas! Highly recommended!",
    date: "2024-01-15",
    role: "Buyer"
  },
  {
    id: 2,
    name: "Siti Rahayu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review: "Sebagai seller, platform ini sangat membantu mengembangkan bisnis saya. Fitur dashboard yang lengkap dan mudah digunakan.",
    date: "2024-01-10",
    role: "Seller"
  },
  {
    id: 3,
    name: "Ahmad Wijaya",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    review: "Driver app-nya sangat membantu mencari order pengiriman. Penghasilan yang kompetitif dan sistem yang transparan.",
    date: "2024-01-08",
    role: "Driver"
  },
  {
    id: 4,
    name: "Maya Indah",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    review: "Customer service sangat responsif! Ada masalah dengan pesanan, langsung di-resolve dengan cepat. Love it!",
    date: "2024-01-05",
    role: "Buyer"
  }
];

// ─── Helper Components ────────────────────────────────────────────────────────

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex gap-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="bg-white text-red-600 rounded-lg px-3 py-2 min-w-[50px] text-center">
          <div className="text-xl font-bold">{String(value).padStart(2, '0')}</div>
          <div className="text-xs capitalize">{unit === 'hours' ? 'Jam' : unit === 'minutes' ? 'Menit' : 'Detik'}</div>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product, variant = "default" }) {
  const [isWishlist, setIsWishlist] = useState(product.isWishlist || false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (variant === "flash") {
    return (
      <div 
        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
          <button 
            onClick={() => setIsWishlist(!isWishlist)}
            className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-red-500 font-bold">{formatPrice(product.salePrice)}</span>
            <span className="text-gray-400 line-through text-sm">{formatPrice(product.originalPrice)}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
            <span className="text-xs text-gray-400">{product.sold} terjual</span>
          </div>
          <div className={`mt-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Button className="w-full bg-[#0066FF] hover:bg-[#0052CC]">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Masukkan Keranjang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={() => setIsWishlist(!isWishlist)}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${isWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#0066FF] font-bold text-lg">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {product.store} • {product.location}
        </div>
        <div className={`mt-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <Button className="w-full bg-[#0066FF] hover:bg-[#0052CC]">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Masukkan Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main HomePage ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 32, seconds: 18 });
  const [email, setEmail] = useState('');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Truck, title: "Gratis Ongkir", desc: "Untuk pembelian di atas Rp 500.000" },
    { icon: ShieldCheck, title: "100% Aman", desc: "Pembayaran terjamin aman" },
    { icon: Headphones, title: "24/7 Support", desc: "Bantuan pelanggan 24 jam" },
    { icon: TrendingUp, title: "Best Deals", desc: "Harga terbaik setiap hari" }
  ];

  const whyChooseUs = [
    { icon: Award, title: "Kualitas Terjamin", desc: "Produk original dengan garansi resmi dari brand terpercaya" },
    { icon: Zap, title: "Pengiriman Cepat", desc: "Pesanan diproses dalam 24 jam dengan tracking real-time" },
    { icon: Users, title: "Komunitas Aktif", desc: "Bergabung dengan jutaan pengguna aktif di seluruh Indonesia" },
    { icon: CreditCard, title: "Pembayaran Aman", desc: "Berbagai metode pembayaran dengan sistem keamanan terkini" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero Banner ───────────────────────────────────────────────────────*/}
      <section className="relative min-h-[600px] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 overflow-hidden">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl" />
          {/* Floating dots */}
          <div className="absolute top-32 right-1/4 w-4 h-4 bg-white/30 rounded-full animate-bounce" />
          <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 right-20 w-2 h-2 bg-cyan-200/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl mx-auto text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Platform E-Commerce Terlengkap di Indonesia</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              SEAPEDIA - Platform
              <span className="block bg-gradient-to-r from-yellow-300 to-cyan-300 bg-clip-text text-transparent">
                E-Commerce Terlengkap
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Temukan jutaan produk berkualitas dengan harga terbaik. 
              Belanja mudah, aman, dan terpercaya.
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative bg-white rounded-full shadow-2xl overflow-hidden">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk, brand, atau kategori..."
                  className="w-full pl-14 pr-32 py-4 text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0066FF] hover:bg-[#0052CC] text-white px-6 py-2 rounded-full font-medium transition-colors">
                  Cari
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button className="bg-white text-[#0066FF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-xl transition-all hover:scale-105">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Jelajahi
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-full transition-all hover:scale-105">
                  <Users className="mr-2 h-5 w-5" />
                  Daftar Sekarang
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 p-2 rounded-full">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Gratis Ongkir</p>
                  <p className="text-xs text-white/70">Min. Rp 500rb</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 p-2 rounded-full">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">100% Aman</p>
                  <p className="text-xs text-white/70">Garansi Uang Kembali</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/20 p-2 rounded-full">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">24/7 Support</p>
                  <p className="text-xs text-white/70">Bantuan Kapan Saja</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories Carousel ─────────────────────────────────────────────*/}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Kategori Populer</h2>
              <p className="text-gray-500 mt-1">Temukan produk dari berbagai kategori</p>
            </div>
            <Link to="/categories" className="flex items-center gap-1 text-[#0066FF] hover:underline font-medium">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`${cat.color} p-4 rounded-full mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                  <span className="text-xs text-gray-400 mt-1">{cat.count} produk</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Flash Sale Section ──────────────────────────────────────────────*/}
      <section className="py-16 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Flash Sale</h2>
                <p className="text-white/80">Jangan lewatkan diskon spesial ini!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white">
                <p className="text-sm mb-1">Berakhir dalam:</p>
                <CountdownTimer endTime="2024-01-31T23:59:59" />
              </div>
              <Link to="/flash-sale">
                <Button className="bg-white text-red-500 hover:bg-gray-100 px-6">
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleProducts.map(product => (
              <ProductCard key={product.id} product={product} variant="flash" />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products Grid ──────────────────────────────────────────*/}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Produk Unggulan</h2>
              <p className="text-gray-500 mt-1">Pilihan terbaik untuk Anda</p>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-[#0066FF] hover:underline font-medium">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─────────────────────────────────────────────────────*/}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Mengapa Memilih Kami?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Kami berkomitmen memberikan pengalaman belanja online terbaik dengan berbagai keunggulan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0066FF] to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ────────────────────────────────────────────*/}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Apa Kata Mereka?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Testimoni dari pengguna yang telah merasakan kemudahan berbelanja di SEAPEDIA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <span className="text-xs text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded-full">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                  "{testimonial.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter CTA ────────────────────────────────────────────────────*/}
      <section className="py-16 bg-gradient-to-r from-[#0066FF] to-cyan-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Berlangganan Newsletter Kami</h2>
            <p className="text-lg text-white/90 mb-8">
              Dapatkan info terbaru tentang produk, promo, dan diskon eksklusif langsung ke inbox Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda..."
                className="flex-1 px-6 py-4 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              Gratis berlangganan • Bisa berhenti kapan saja • Tidak ada spam
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────────*/}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-cyan-400 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold">SEAPEDIA</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Platform e-commerce terlengkap di Indonesia. Belanja mudah, aman, dan terpercaya dengan jutaan produk berkualitas.
              </p>
              <div className="flex gap-3">
                {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                  <a 
                    key={social}
                    href={`#${social}`}
                    className="w-9 h-9 bg-gray-800 hover:bg-[#0066FF] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs font-bold uppercase">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-3">
                {['Tentang Kami', 'Karir', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Pusat Bantuan', 'Kontak Kami'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#0066FF] transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kategori Populer</h3>
              <ul className="space-y-3">
                {['Elektronik', 'Fashion Pria', 'Fashion Wanita', 'Kecantikan', 'Rumah Tangga', 'Olahraga'].map((cat) => (
                  <li key={cat}>
                    <a href="#" className="text-gray-400 hover:text-[#0066FF] transition-colors text-sm">
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hubungi Kami</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#0066FF] shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">
                    Jl. Sudirman No. 123, Jakarta Pusat, Indonesia 10220
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-[#0066FF] font-bold text-lg">@</span>
                  </div>
                  <span className="text-gray-400 text-sm">support@seapedia.id</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 flex items-center justify-center shrink-0">
                    <span className="text-[#0066FF] font-bold text-sm">TEL</span>
                  </div>
                  <span className="text-gray-400 text-sm">+62 21 1234 5678</span>
                </li>
              </ul>

              {/* Payment methods */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Metode Pembayaran:</p>
                <div className="flex flex-wrap gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI', 'OVO', 'Gopay', 'DANA', 'Visa'].map((payment) => (
                    <span 
                      key={payment}
                      className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded"
                    >
                      {payment}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">
                © {new Date().getFullYear()} SEAPEDIA. All rights reserved. Platform E-Commerce Indonesia.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">Terms</a>
                <a href="#" className="text-gray-500 hover:text-[#0066FF] text-sm transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
