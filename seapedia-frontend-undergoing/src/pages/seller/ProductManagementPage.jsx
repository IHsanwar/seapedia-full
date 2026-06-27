import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { storeAPI, sellerProductAPI } from '../../api/seller';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Store,
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Search,
  LayoutGrid,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'react-toastify';

function resolveImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/storage/${image}`;
}

function ProductCard({ product, onEdit, onDelete, deleting }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const thumb = resolveImageUrl(product.thumbnail_image || product.thumbnail_url);

  return (
    <Card className="group overflow-hidden bg-white border border-border shadow-sm rounded-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
          <Badge variant={product.is_active === false ? 'secondary' : 'default'} className="shrink-0 text-[11px]">
            {product.is_active === false ? 'Inactive' : 'Active'}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description || 'Tidak ada deskripsi'}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-[#003f87] text-sm">
            Rp {Number(product.price || 0).toLocaleString('id-ID')}
          </span>
          <Badge variant="secondary" className="text-xs">
            Stok: {product.stock ?? 0}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 border-[#003f87] text-[#003f87]" onClick={() => onEdit(product)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Hapus Produk</DialogTitle>
                <DialogDescription>
                  Apakah kamu yakin ingin menghapus <strong>{product.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={async () => {
                    await onDelete(product.id);
                    setConfirmOpen(false);
                  }}
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const storeRes = await storeAPI.getStore();
      if (storeRes?.success && storeRes?.data) {
        const storeData = storeRes.data?.data ?? storeRes.data;
        setStore(storeData);
        setHasStore(true);

        try {
          const prodRes = await sellerProductAPI.getProducts();
          const prodData = prodRes?.data ?? [];
          setProducts(Array.isArray(prodData) ? prodData : (prodData?.data ?? []));
        } catch {
          setProducts([]);
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setHasStore(false);
        setStore(null);
      } else {
        const message = err.response?.data?.message || 'Gagal memuat data toko';
        setLoadError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };
    run();
  }, [fetchData]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await sellerProductAPI.deleteProduct(id);
      toast.success('Produk berhasil dihapus');
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus produk');
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      (product.name || '').toLowerCase().includes(query)
      || (product.description || '').toLowerCase().includes(query)
    );
  });

  const lowStockCount = products.filter((product) => Number(product.stock || 0) <= 5).length;

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
        <p className="text-sm text-muted-foreground">Memuat data produk...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold">Gagal Memuat Toko</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#006b5f] hover:bg-[#005a50]" onClick={fetchData}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!hasStore) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-[#006b5f]/10 text-[#006b5f] p-4 rounded-sm mb-4 w-fit">
              <Store className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Buat Tokomu</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Hai <strong>{user?.name}</strong>! Kamu belum memiliki toko. Daftarkan tokomu untuk mulai mengelola produk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full font-semibold bg-[#006b5f] hover:bg-[#005a50]" onClick={() => navigate('/seller/store/create')}>
              <Plus className="h-4 w-4 mr-2" /> Buat Toko Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card className="mb-8 bg-white border border-border shadow-sm rounded-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#006b5f]/10 text-[#006b5f] p-3 rounded-sm">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#006b5f]">{store?.store_name ?? 'Toko Saya'}</h1>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {store?.description || 'Belum ada deskripsi'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="border-[#003f87] text-[#003f87]" onClick={() => navigate('/seller/store/edit')}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Toko
                  </Button>
                  <Button size="sm" className="bg-[#006b5f] hover:bg-[#005a50]" onClick={() => navigate('/seller/products/create')}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Produk
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-sm border border-border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Total Produk</p>
                  <p className="text-lg font-bold flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-[#006b5f]" /> {products.length}
                  </p>
                </div>
                <div className="rounded-sm border border-border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Produk Terfilter</p>
                  <p className="text-lg font-bold flex items-center gap-2 mt-1">
                    <LayoutGrid className="h-4 w-4 text-[#006b5f]" /> {filteredProducts.length}
                  </p>
                </div>
                <div className="rounded-sm border border-border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Stok Rendah</p>
                  <p className="text-lg font-bold flex items-center gap-2 mt-1">
                    <ShoppingBag className="h-4 w-4 text-[#ba1a1a]" /> {lowStockCount}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#006b5f]">
              <Package className="h-5 w-5" />
              Manajemen Produk
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola produk toko, edit detail, atau hapus produk yang sudah tidak dijual.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-sm border-border"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card className="border-dashed bg-white border border-border rounded-sm">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground text-center">
                {products.length === 0
                  ? 'Belum ada produk. Mulai tambahkan produk pertamamu.'
                  : 'Tidak ada produk yang cocok dengan pencarianmu.'}
              </p>
              {products.length === 0 && (
                <Button variant="outline" size="sm" className="border-[#003f87] text-[#003f87]" onClick={() => navigate('/seller/products/create')}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Produk
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(item) => navigate(`/seller/products/${item.id}/edit`)}
                onDelete={handleDelete}
                deleting={deleting === product.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
