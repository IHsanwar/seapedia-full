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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const VEHICLE_TYPES = [
  { value: 'motor', label: 'Motor' },
  { value: 'mobil', label: 'Mobil' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
];

export default function DriverRegisterPage() {
  const { user } = useAuth();
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
      newErrors.vehicle_type = 'Vehicle type is required';
    }

    if (!formData.vehicle_plate_number.trim()) {
      newErrors.vehicle_plate_number = 'License plate is required';
    } else if (formData.vehicle_plate_number.length < 5) {
      newErrors.vehicle_plate_number = 'License plate must be at least 5 characters';
    } else if (formData.vehicle_plate_number.length > 15) {
      newErrors.vehicle_plate_number = 'License plate must not exceed 15 characters';
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
        toast.success('Driver registration successful!');
        navigate('/driver/dashboard');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-orange-200 dark:border-orange-800">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full">
              <Truck className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Driver Registration</CardTitle>
          <CardDescription>
            Complete your driver profile to start delivering orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => {
                  setFormData({ ...formData, vehicle_type: value });
                  setErrors({ ...errors, vehicle_type: '' });
                }}
              >
                <SelectTrigger
                  id="vehicle_type"
                  className={errors.vehicle_type ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_type && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.vehicle_type}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_plate_number">License Plate Number</Label>
              <Input
                id="vehicle_plate_number"
                type="text"
                placeholder="e.g., B 1234 ABC"
                value={formData.vehicle_plate_number}
                onChange={(e) => {
                  setFormData({ ...formData, vehicle_plate_number: e.target.value.toUpperCase() });
                  setErrors({ ...errors, vehicle_plate_number: '' });
                }}
                className={errors.vehicle_plate_number ? 'border-red-500' : ''}
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
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register as Driver'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}