import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeAPI } from '../../api/seller';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Store, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function StoreFormPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { fetchMe } = useAuth();
  const isEdit = pathname.includes('/edit');

  const [form, setForm] = useState({
    store_name: '',
    description: '',
    phone: '',      // initialized as empty string (not undefined)
    address: '',    // initialized as empty string (not undefined)
    logo: null,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Fetch existing store data when editing ──────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await storeAPI.getStore();
        const data = res?.data?.data ?? res?.data ?? {};
        setForm({
          store_name: data.store_name || '',
          description: data.description || '',
          phone: data.phone || '',       // populate from API
          address: data.address || '',   // populate from API
          logo: null,                    // file inputs can't be pre-filled
        });
      } catch {
        toast.error('Gagal memuat data toko');
        navigate('/seller/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, navigate]);

  // ── Handle input change ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    // Client-side validation
    const newErrors = {};
    if (!form.store_name.trim()) newErrors.store_name = 'Nama toko wajib diisi';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    // Use FormData so the logo file is actually sent as multipart/form-data
    const payload = new FormData();
    payload.append('store_name', form.store_name.trim());
    payload.append('description', form.description.trim());
    if (form.phone?.trim())   payload.append('phone', form.phone.trim());
    if (form.address?.trim()) payload.append('address', form.address.trim());
    if (form.logo instanceof File) payload.append('logo', form.logo);

    // Laravel needs this to treat a POST as PUT for file uploads
    if (isEdit) payload.append('_method', 'PUT');

    try {
      if (isEdit) {
        await storeAPI.updateStore(payload);
        toast.success('Toko berhasil diperbarui!');
      } else {
        await storeAPI.createStore(payload);
        toast.success('Toko berhasil dibuat!');
      }
      await fetchMe();
      navigate('/seller/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        toast.error(res?.message || 'Gagal menyimpan toko');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
        <p className="text-sm text-muted-foreground">Memuat data toko...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <div
          role="button"
          tabIndex={0}
          className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors hover:bg-white hover:text-[#006b5f] h-7 px-2.5 mb-4 cursor-pointer gap-1 select-none"
          onClick={() => navigate(-1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </div>

        <Card className="bg-white border border-border shadow-sm rounded-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-[#006b5f]/10 text-[#006b5f] p-3 rounded-sm mb-3 w-fit">
              <Store className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-bold">
              {isEdit ? 'Edit Toko' : 'Buat Toko Baru'}
            </CardTitle>
            <CardDescription className="text-sm">
              {isEdit
                ? 'Perbarui informasi tokomu di SEAPEDIA.'
                : 'Isi informasi tokomu untuk mulai berjualan di SEAPEDIA.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Store Logo */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Toko</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="rounded-sm border-border"
                  onChange={(e) => {
                    const file = e.target.files[0] || null;
                    setForm((prev) => ({ ...prev, logo: file }));
                  }}
                />
              </div>

              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="store_name">
                  Nama Toko <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="store_name"
                  name="store_name"
                  placeholder="Contoh: Toko Sejahtera"
                  value={form.store_name}
                  onChange={handleChange}
                  aria-invalid={!!errors.store_name}
                  className={`rounded-sm border-border ${errors.store_name ? 'border-destructive' : ''}`}
                />
                {errors.store_name && (
                  <p className="text-xs text-destructive">
                    {Array.isArray(errors.store_name) ? errors.store_name[0] : errors.store_name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Ceritakan tentang tokomu..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-[#006b5f] focus-visible:ring-1 focus-visible:ring-[#006b5f]/50 placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Contoh: 081234567890"
                  value={form.phone}
                  onChange={handleChange}
                  aria-invalid={!!errors.phone}
                  className={`rounded-sm border-border ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Contoh: Jl. Merdeka No. 123, Jakarta"
                  value={form.address}
                  onChange={handleChange}
                  aria-invalid={!!errors.address}
                  className={`rounded-sm border-border ${errors.address ? 'border-destructive' : ''}`}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {Array.isArray(errors.address) ? errors.address[0] : errors.address}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full font-semibold bg-[#006b5f] hover:bg-[#005a50] rounded-sm" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEdit ? 'Simpan Perubahan' : 'Buat Toko'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
