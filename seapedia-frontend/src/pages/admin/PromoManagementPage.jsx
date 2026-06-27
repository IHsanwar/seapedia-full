import React, { useState, useEffect } from 'react';
import { promosAPI } from '../../api/promos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function PromoManagementPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'fixed',
    value: '',
    max_discount: '',
    minimum_purchase: '0',
    expired_at: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await promosAPI.getAllPromos();
      // the index endpoint might have pagination or just raw data. Let's check format.
      // Response structure should contain data either directly or inside a data envelope.
      setPromos(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
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
      const payload = {
        ...formData,
        is_active: !!formData.is_active,
        value: parseFloat(formData.value),
        minimum_purchase: formData.minimum_purchase ? parseFloat(formData.minimum_purchase) : 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      };

      if (editingPromo) {
        await promosAPI.updatePromo(editingPromo.id, payload);
      } else {
        await promosAPI.createPromo(payload);
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPromos();
    } catch (error) {
      console.error('Error saving promo:', error);
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      max_discount: promo.max_discount || '',
      minimum_purchase: promo.minimum_purchase || '0',
      expired_at: promo.expired_at ? promo.expired_at.split('T')[0] : '',
      is_active: !!promo.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo?')) {
      try {
        await promosAPI.deletePromo(id);
        fetchPromos();
      } catch (error) {
        console.error('Error deleting promo:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      type: 'fixed',
      value: '',
      max_discount: '',
      minimum_purchase: '0',
      expired_at: '',
      is_active: true,
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promo Management</h1>
          <p className="text-muted-foreground">Create and manage global promo codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Promo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit Promo' : 'Add New Promo'}</DialogTitle>
              <DialogDescription>
                {editingPromo ? 'Update promo code details' : 'Create a new promo code'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., BLACKFRIDAY"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingPromo ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {promos.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">No promos found.</p>
        ) : (
          promos.map((promo) => (
            <Card key={promo.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{promo.code}</CardTitle>
                    <CardDescription>
                      {promo.type === 'fixed'
                        ? `Rp ${parseInt(promo.value).toLocaleString('id-ID')} off`
                        : `${promo.value}% off${promo.max_discount ? ` (max: Rp ${parseInt(promo.max_discount).toLocaleString('id-ID')})` : ''}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(promo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min. Purchase</p>
                    <p className="font-medium">Rp {parseInt(promo.minimum_purchase || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">{new Date(promo.expired_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`font-medium ${promo.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
