import React, { useState, useEffect } from 'react';
import { adminVoucherAPI } from '../../api/vouchers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function VoucherManagementPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'fixed',
    value: '',
    max_discount: '',
    minimum_purchase: '0',
    remaining_usage: '0',
    expired_at: '',
    is_active: true,
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await adminVoucherAPI.getVouchers();
      // Handle various response formats and ensure it's always an array
      let vouchersData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        vouchersData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        vouchersData = response.data;
      } else if (Array.isArray(response)) {
        vouchersData = response;
      }
      setVouchers(vouchersData);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await adminVoucherAPI.updateVoucher(editingVoucher.id, formData);
      } else {
        await adminVoucherAPI.createVoucher(formData);
      }
      setIsDialogOpen(false);
      resetForm();
      fetchVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
    }
  };

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      max_discount: voucher.max_discount || '',
      minimum_purchase: voucher.minimum_purchase,
      remaining_usage: voucher.remaining_usage,
      expired_at: voucher.expired_at ? voucher.expired_at.split('T')[0] : '',
      is_active: voucher.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await adminVoucherAPI.deleteVoucher(id);
        fetchVouchers();
      } catch (error) {
        console.error('Error deleting voucher:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      type: 'fixed',
      value: '',
      max_discount: '',
      minimum_purchase: '0',
      remaining_usage: '0',
      expired_at: '',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#F0F7FF]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0066FF]">Voucher Management</h1>
          <p className="text-muted-foreground">Create and manage global voucher codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-lg max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0066FF]">{editingVoucher ? 'Edit Voucher' : 'Add New Voucher'}</DialogTitle>
              <DialogDescription>
                {editingVoucher ? 'Update voucher details' : 'Create a new voucher for buyers'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Voucher Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SUMMER2024"
                    required
                    className="border-border rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="border-border rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percent">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Discount Value</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'percent' ? 'e.g., 10' : 'e.g., 50000'}
                    required
                    className="border-border rounded-lg"
                  />
                </div>
                {formData.type === 'percent' && (
                  <div className="grid gap-2">
                    <Label htmlFor="max_discount">Maximum Discount (Optional)</Label>
                    <Input
                      id="max_discount"
                      name="max_discount"
                      type="number"
                      step="0.01"
                      value={formData.max_discount}
                      onChange={handleInputChange}
                      placeholder="e.g., 100000"
                      className="border-border rounded-lg"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="minimum_purchase">Minimum Purchase</Label>
                  <Input
                    id="minimum_purchase"
                    name="minimum_purchase"
                    type="number"
                    step="0.01"
                    value={formData.minimum_purchase}
                    onChange={handleInputChange}
                    placeholder="e.g., 100000"
                    className="border-border rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remaining_usage">Remaining Usage (0 = Unlimited)</Label>
                  <Input
                    id="remaining_usage"
                    name="remaining_usage"
                    type="number"
                    value={formData.remaining_usage}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    className="border-border rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expired_at">Expiration Date</Label>
                  <Input
                    id="expired_at"
                    name="expired_at"
                    type="date"
                    value={formData.expired_at}
                    onChange={handleInputChange}
                    required
                    className="border-border rounded-lg"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg">{editingVoucher ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {Array.isArray(vouchers) && vouchers.map((voucher) => (
          <Card key={voucher.id} className="bg-white border border-border shadow-sm rounded-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-[#0066FF]">{voucher.code}</CardTitle>
                  <CardDescription>
                    {voucher.type === 'fixed'
                      ? `Rp ${parseInt(voucher.value).toLocaleString('id-ID')} off`
                      : `${voucher.value}% off${voucher.max_discount ? ` (max: Rp ${parseInt(voucher.max_discount).toLocaleString('id-ID')})` : ''}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(voucher)} className="border-[#0066FF] text-[#0066FF] hover:bg-[#F0F7FF] rounded-lg">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(voucher.id)} className="bg-[#FF4444] hover:bg-[#E63333] rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Min. Purchase</p>
                  <p className="font-medium text-foreground">Rp {parseInt(voucher.minimum_purchase).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining Usage</p>
                  <p className="font-medium text-foreground">{voucher.remaining_usage === 0 ? 'Unlimited' : voucher.remaining_usage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium text-foreground">{new Date(voucher.expired_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={`font-medium ${voucher.is_active ? 'text-[#00AA66]' : 'text-[#FF4444]'}`}>
                    {voucher.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
