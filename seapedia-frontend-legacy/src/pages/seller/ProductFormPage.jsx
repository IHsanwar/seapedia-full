import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sellerProductAPI } from '../../api/seller';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Package, Loader2, ArrowLeft, ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // undefined = create, defined = edit
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });
  const [thumbnail, setThumbnail] = useState(null);       // File object
  const [thumbPreview, setThumbPreview] = useState(null); // Data URL preview
  const [existingThumb, setExistingThumb] = useState(null); // URL from backend
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // â”€â”€ Fetch existing product when editing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await sellerProductAPI.getProduct(id);
        const data = res?.data?.data ?? res?.data ?? {};
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          stock: data.stock ?? '',
        });
        const thumb = data.thumbnail_image || data.thumbnail_url;
        if (thumb) {
          setExistingThumb(
            thumb.startsWith('http')
              ? thumb
              : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${thumb}`
          );
        }
      } catch {
        toast.error('Gagal memuat data produk');
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // â”€â”€ Handle text input change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // â”€â”€ Handle thumbnail file selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setErrors((prev) => ({ ...prev, thumbnail_image: null }));

    const reader = new FileReader();
    reader.onloadend = () => setThumbPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nama produk wajib diisi';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      newErrors.price = 'Harga tidak valid';
    if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      newErrors.stock = 'Stok tidak valid';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      if (thumbnail) formData.append('thumbnail_image', thumbnail);

      if (isEdit) {
        await sellerProductAPI.updateProduct(id, formData);
        toast.success('Produk berhasil diperbarui!');
      } else {
        await sellerProductAPI.createProduct(formData);
        toast.success('Produk berhasil ditambahkan!');
      }
      navigate('/seller/products');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        toast.error(res?.message || 'Gagal menyimpan produk');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data produkâ€¦</p>
      </div>
    );
  }

  const previewSrc = thumbPreview || existingThumb;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/seller/products')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <Card className="border shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-50 dark:bg-green-950 text-green-600 p-3 rounded-xl mb-3 w-fit">
            <Package className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isEdit ? 'Perbarui informasi produk tokomu.' : 'Isi detail produk yang ingin kamu jual.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">

            {/* â”€â”€ Thumbnail image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="space-y-2">
              <Label>Foto Produk</Label>
              <label
                htmlFor="thumbnail_image"
                className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors gap-2"
              >
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">Klik untuk memilih gambar (max 2MB)</span>
                  </>
                )}
              </label>
              <input
                id="thumbnail_image"
                name="thumbnail_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {errors.thumbnail_image && (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.thumbnail_image) ? errors.thumbnail_image[0] : errors.thumbnail_image}
                </p>
              )}
            </div>

            {/* â”€â”€ Product name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Produk <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Udang Vaname Segar 500g"
                value={form.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                </p>
              )}
            </div>

            {/* â”€â”€ Description â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Deskripsikan produkmuâ€¦"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground resize-none dark:bg-input/30"
              />
            </div>

            {/* â”€â”€ Price & Stock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Harga (Rp) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="50000"
                  value={form.price}
                  onChange={handleChange}
                  aria-invalid={!!errors.price}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">
                    {Array.isArray(errors.price) ? errors.price[0] : errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stok <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="100"
                  value={form.stock}
                  onChange={handleChange}
                  aria-invalid={!!errors.stock}
                  className={errors.stock ? 'border-destructive' : ''}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">
                    {Array.isArray(errors.stock) ? errors.stock[0] : errors.stock}
                  </p>
                )}
              </div>
            </div>

            {/* â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <Button type="submit" className="w-full font-semibold" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

