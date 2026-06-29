import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { driverAPI } from '../../api/driver';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Truck, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const VEHICLE_TYPES = [
  { value: 'motor', label: 'Motor' },
  { value: 'mobil', label: 'Mobil' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truk' },
];

export default function DriverRegisterPage() {
  const { user, fetchMe, switchRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_plate_number: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle_type) {
      newErrors.vehicle_type = 'Jenis kendaraan wajib dipilih';
    }

    if (!formData.vehicle_plate_number.trim()) {
      newErrors.vehicle_plate_number = 'Nomor plat wajib diisi';
    } else if (formData.vehicle_plate_number.length < 5) {
      newErrors.vehicle_plate_number = 'Nomor plat minimal 5 karakter';
    } else if (formData.vehicle_plate_number.length > 15) {
      newErrors.vehicle_plate_number = 'Nomor plat maksimal 15 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await driverAPI.register(formData);

      if (response.success) {
        toast.success('Pendaftaran driver berhasil!');
        // Refresh user data agar has_driver_profile = true
        await fetchMe();
        // Switch ke role driver untuk mendapatkan token dengan ability role:driver
        try {
          await switchRole('driver');
        } catch {
          // Jika switchRole gagal, fetchMe sudah cukup untuk update state
        }
        navigate('/driver/dashboard', { replace: true });
      } else {
        toast.error(response.message || 'Pendaftaran gagal');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[#722b00] bg-white rounded-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="bg-[#722b00]/10 p-4 rounded-sm">
              <Truck className="h-8 w-8 text-[#722b00]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#722b00]">Pendaftaran Driver</CardTitle>
          <CardDescription className="text-muted-foreground">
            Lengkapi profil driver kamu untuk mulai mengantarkan pesanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Jenis Kendaraan – native select agar lebih kompatibel */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_type" className="text-foreground">Jenis Kendaraan</Label>
              <div className="relative">
                <select
                  id="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicle_type: e.target.value });
                    setErrors({ ...errors, vehicle_type: '' });
                  }}
                  className={`flex h-10 w-full appearance-none rounded-sm border bg-background px-3 py-2 pr-9 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#722b00] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.vehicle_type ? 'border-red-500' : 'border-border'
                  }`}
                >
                  <option value="" disabled>Pilih jenis kendaraan</option>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.vehicle_type && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.vehicle_type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_plate_number" className="text-foreground">Nomor Plat Kendaraan</Label>
              <Input
                id="vehicle_plate_number"
                type="text"
                placeholder="Contoh: B 1234 ABC"
                value={formData.vehicle_plate_number}
                onChange={(e) => {
                  setFormData({ ...formData, vehicle_plate_number: e.target.value.toUpperCase() });
                  setErrors({ ...errors, vehicle_plate_number: '' });
                }}
                className={`rounded-sm ${errors.vehicle_plate_number ? 'border-red-500' : 'border-border'}`}
                maxLength={15}
              />
              {errors.vehicle_plate_number && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.vehicle_plate_number}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#722b00] hover:bg-[#5c2300] text-white rounded-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                'Daftar sebagai Driver'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
