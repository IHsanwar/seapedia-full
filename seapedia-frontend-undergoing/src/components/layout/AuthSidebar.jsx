import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';

const features = [
  { icon: ShoppingBag, title: "Berbagai Pilihan Produk", desc: "Pilihan produk terlengkap" },
  { icon: Truck, title: "Pengiriman Cepat", desc: "Sampai dalam 1-3 hari" },
  { icon: Shield, title: "100% Aman", desc: "Garansi uang kembali" },
  { icon: Headphones, title: "24/7 Support", desc: "Bantuan kapan saja" }
];

export default function AuthSidebar({ quote = "Platform e-commerce terbaik untuk berbelanja online di Indonesia." }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop")'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/90 to-blue-800/90" />
      
      <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        {/* Top - Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-[#0066FF]" />
          </div>
          <span className="text-2xl font-bold">SEAPEDIA</span>
        </div>

        {/* Middle - Quote */}
        <div className="max-w-md">
          <blockquote className="text-2xl font-light italic mb-6 leading-relaxed">
            "{quote}"
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              S
            </div>
            <div>
              <p className="font-semibold">Seapedia Team</p>
              <p className="text-sm text-white/70">E-Commerce Platform</p>
            </div>
          </div>
        </div>

        {/* Bottom - Features */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Icon className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-white/70">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
