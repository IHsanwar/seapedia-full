import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addressAPI } from '../../api/address';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  MapPin, ArrowLeft, Plus, Loader2, Edit, Trash2,
  Home, Briefcase, Star, Check
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    recipient_phone: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
    is_default: false,
    notes: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await addressAPI.getAddresses();
      setAddresses(res?.data || res);
    } catch (err) {
      toast.error('Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, formData);
        toast.success('Alamat berhasil diperbarui!');
      } else {
        await addressAPI.createAddress(formData);
        toast.success('Alamat berhasil ditambahkan!');
      }
      setShowModal(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || '',
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      address: address.address,
      city: address.city,
      postal_code: address.postal_code,
      province: address.province,
      is_default: address.is_default,
      notes: address.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    
    try {
      await addressAPI.deleteAddress(id);
      toast.success('Alamat berhasil dihapus!');
      fetchAddresses();
    } catch (err) {
      toast.error('Gagal menghapus alamat');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefaultAddress(id);
      toast.success('Alamat default berhasil diubah!');
      fetchAddresses();
    } catch (err) {
      toast.error('Gagal mengubah alamat default');
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      recipient_name: '',
      recipient_phone: '',
      address: '',
      city: '',
      postal_code: '',
      province: '',
      is_default: false,
      notes: ''
    });
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    resetForm();
    setShowModal(true);
  };

  const getLabelIcon = (label) => {
    const lowerLabel = label?.toLowerCase() || '';
    if (lowerLabel.includes('rumah') || lowerLabel.includes('home')) {
      return <Home className="h-4 w-4" />;
    } else if (lowerLabel.includes('kantor') || lowerLabel.includes('office') || lowerLabel.includes('kerja')) {
      return <Briefcase className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#006b5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/buyer/dashboard" className="inline-flex items-center text-sm text-[#003f87] hover:text-[#006b5f] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke dashboard
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#003f87]">Alamat Pengiriman</h1>
              <p className="text-gray-600">Kelola alamat pengiriman Anda</p>
            </div>
            <Button onClick={handleAddNew} className="bg-[#006b5f] hover:bg-[#005a50]">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Alamat
            </Button>
          </div>

          {/* Address List */}
          {addresses.length === 0 ? (
            <Card className="bg-white border border-border shadow-sm rounded-sm">
              <CardContent className="py-12 text-center">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-semibold mb-2 text-[#003f87]">Belum ada alamat</h3>
                <p className="text-gray-500 mb-4">Tambahkan alamat pengiriman untuk memudahkan proses checkout</p>
                <Button onClick={handleAddNew} className="bg-[#006b5f] hover:bg-[#005a50]">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Alamat Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <Card key={address.id} className={`bg-white border shadow-sm rounded-sm ${address.is_default ? 'border-[#006b5f] ring-1 ring-[#006b5f]' : 'border-border'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {address.is_default && (
                            <Badge className="bg-[#006b5f]/10 text-[#006b5f] hover:bg-[#006b5f]/10">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                          {address.label && (
                            <Badge variant="outline" className="flex items-center gap-1 border-border">
                              {getLabelIcon(address.label)}
                              {address.label}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1 text-[#003f87]">{address.recipient_name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{address.recipient_phone}</p>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-500">{address.city}, {address.province} {address.postal_code}</p>
                          {address.notes && (
                            <p className="text-gray-500 italic">{address.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!address.is_default && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(address.id)}
                            className="border-[#006b5f] text-[#006b5f] hover:bg-[#006b5f]/10"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Jadikan Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(address)}
                          className="border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(address.id)}
                          className="border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8 bg-white border border-border shadow-sm rounded-sm">
              <CardHeader>
                <CardTitle className="text-[#003f87]">{editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</CardTitle>
                <CardDescription>
                  {editingAddress ? 'Perbarui informasi alamat pengiriman' : 'Isi detail alamat pengiriman Anda'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label (Opsional)</Label>
                      <Input
                        id="label"
                        name="label"
                        placeholder="Contoh: Rumah, Kantor"
                        value={formData.label}
                        onChange={handleInputChange}
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient_name">Nama Penerima *</Label>
                      <Input
                        id="recipient_name"
                        name="recipient_name"
                        placeholder="Nama lengkap penerima"
                        value={formData.recipient_name}
                        onChange={handleInputChange}
                        required
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient_phone">Nomor Telepon *</Label>
                      <Input
                        id="recipient_phone"
                        name="recipient_phone"
                        placeholder="081234567890"
                        value={formData.recipient_phone}
                        onChange={handleInputChange}
                        required
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Provinsi *</Label>
                      <Input
                        id="province"
                        name="province"
                        placeholder="Contoh: Jawa Barat"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Kota/Kabupaten *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Contoh: Bandung"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Kode Pos *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        placeholder="Contoh: 40123"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        required
                        className="border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap *</Label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm transition-colors outline-none focus:border-[#006b5f] focus:ring-1 focus:ring-[#006b5f]/50 placeholder:text-gray-400 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      placeholder="Contoh: Patokan dekat masjid, pagar hitam"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm transition-colors outline-none focus:border-[#006b5f] focus:ring-1 focus:ring-[#006b5f]/50 placeholder:text-gray-400 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#006b5f] focus:ring-[#006b5f]"
                    />
                    <Label htmlFor="is_default" className="cursor-pointer text-[#003f87]">
                      Jadikan sebagai alamat default
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowModal(false);
                        setEditingAddress(null);
                        resetForm();
                      }}
                      disabled={submitting}
                      className="flex-1 border-border"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 bg-[#006b5f] hover:bg-[#005a50]"
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingAddress ? 'Simpan Perubahan' : 'Tambah Alamat'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
