import React from 'react';
import { Play } from 'lucide-react';

const videos = [
  {
    id: 1,
    title: 'SEApedia Overview',
    description: 'Pengenalan singkat mengenai platform SEApedia dan fitur-fiturnya.',
    youtubeId: 'jNQXAC9IVRw', 
  },
  {
    id: 2,
    title: 'Cara Berbelanja (Buyer)',
    description: 'Panduan lengkap cara mencari produk, menggunakan voucher, dan checkout.',
    youtubeId: 'M7lc1UVf-VE', // YouTube Developers placeholder
  },
  {
    id: 3,
    title: 'Kelola Toko (Seller)',
    description: 'Cara mengelola produk, stok, dan memproses pesanan masuk untuk penjual.',
    youtubeId: 'dQw4w9WgXcQ', // Rickroll placeholder
  },
  {
    id: 4,
    title: 'Proses Pengiriman (Driver)',
    description: 'Demonstrasi aplikasi untuk driver dalam mengambil dan menyelesaikan pesanan.',
    youtubeId: 'tgbNymZ7vqY', // Muppets placeholder
  }
];

export default function VideoDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Play className="h-8 w-8 text-[#003f87]" />
          Video Demonstrasi SEApedia
        </h1>
        <p className="text-slate-600 mt-2">
          Pelajari cara menggunakan berbagai fitur SEApedia melalui galeri video demonstrasi di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video w-full bg-slate-100 relative">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{video.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
