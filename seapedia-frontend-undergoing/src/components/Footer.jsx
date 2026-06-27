import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#eff4ff] mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <h3 className="font-semibold text-lg text-foreground">SEAPEDIA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform multi-commerce yang mendukung pembayaran, pengiriman, dan transaksi antara Buyer, Seller, dan Driver.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-foreground">Belanja</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">Semua Produk</Link></li>
              <li className="cursor-default">Kategori Populer</li>
              <li className="cursor-default">Promo & Diskon</li>
              <li className="cursor-default">Produk Terbaru</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-foreground">Untuk Partner</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-colors">Daftar Sebagai Seller</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Bergabung Jadi Driver</Link></li>
              <li className="cursor-default">Panduan Partner</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-foreground">Bantuan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="cursor-default">Pusat Bantuan</li>
              <li className="cursor-default">Syarat & Ketentuan</li>
              <li className="cursor-default">Kebijakan Privasi</li>
              <li className="cursor-default">Hubungi Kami</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SEAPEDIA. All rights reserved. Multi-commerce platform for everyone.
        </div>
      </div>
    </footer>
  );
}
