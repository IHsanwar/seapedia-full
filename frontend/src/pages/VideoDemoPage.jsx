import { Link } from 'react-router-dom';
import { Play, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const video = {
  title: 'SEAPEDIA Overview',
  description: 'Flow singkat aplikasi dan alur dasar transaksi — dari registrasi, belanja, jualan, hingga pengiriman.',
  youtubeId: 'UgmPDr7hkJY',
};
const GITHUB_DOCS_URL='https://github.com/IHsanwar/seapedia-full'
const API_DOCS_URL = 'https://seapedia.ciphera.my.id/docs';

export default function VideoDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-6 md:px-[24px] py-12">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground rounded-sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Beranda
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-sm">
              <Play className="h-5 w-5 text-primary" />
            </div>
            Video Demonstrasi
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Pelajari cara menggunakan berbagai fitur SEAPEDIA melalui video demonstrasi di bawah ini.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="aspect-video w-full bg-muted relative">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">{video.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-2">Dokumentasi API</p>
          <a
            href={API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Lihat Dokumentasi API
          </a>
          
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-2">Repository Github</p>
          <a
            href={GITHUB_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Lihat Dokumentasi Github
          </a>
          
        </div>
      </div>
    </div>
  );
}
