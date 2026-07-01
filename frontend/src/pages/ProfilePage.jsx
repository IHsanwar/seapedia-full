import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { profileAPI } from '../api/profile';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Loader2, User, Mail, Phone, MapPin, Store as StoreIcon, ShoppingBag, Truck, Shield, ArrowLeft, Pencil, Trash2, Image } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { isAuthenticated, activeRole, fetchMe, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getMe();
        const userData = res.data?.user || res.data || res;
        setProfile(userData);
        setFormData({
          name: userData.name || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar_url: userData.avatar_url || '',
        });
      } catch (err) {
        toast.error('Gagal memuat profil: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        name: profile?.name || '',
        username: profile?.username || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
      });
    }
    setIsEditing((prev) => !prev);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileAPI.updateProfile(formData);
      await fetchMe();
      const res = await authAPI.getMe();
      const userData = res.data?.user || res.data || res;
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        avatar_url: userData.avatar_url || '',
      });
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await profileAPI.deleteProfile();
      toast.success('Akun berhasil dihapus.');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error('Gagal menghapus akun: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#f8f9ff] min-h-screen">
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto bg-white border border-border shadow-sm rounded-sm">
            <CardContent className="p-8">
              <Shield className="h-16 w-16 text-[#003f87] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#003f87] mb-4">Autentikasi Diperlukan</h2>
              <p className="text-muted-foreground mb-6">Silakan login untuk melihat profil kamu.</p>
              <Button asChild className="w-full bg-[#003f87] hover:bg-[#002f65]">
                <Link to="/login">Masuk</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#f8f9ff] min-h-screen">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#003f87]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#003f87] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke dashboard
        </Link>

        <div className="space-y-6">
          <Card className="bg-white border border-border shadow-sm rounded-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#003f87]/20 to-[#003f87]/10 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="object-cover w-full h-full" />
                    ) : (
                      <User className="h-10 w-10 text-[#003f87]" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-[#003f87]">{profile?.name || 'User'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>@{profile?.username || 'username'}</span>
                      {activeRole && (
                        <Badge variant="secondary" className="capitalize bg-[#003f87]/10 text-[#003f87]">
                          {activeRole}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  className="border-[#003f87] text-[#003f87] hover:bg-[#003f87]/10"
                >
                  {isEditing ? (
                    'Batal'
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" /> Edit Profil
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-border shadow-sm rounded-sm">
            <CardHeader>
              <CardTitle className="text-[#003f87]">Informasi Profil</CardTitle>
              <CardDescription>{isEditing ? 'Edit informasi pribadi kamu' : 'Informasi pribadi kamu'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={isEditing ? formData.name : (profile?.name || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 border-border bg-background rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      value={isEditing ? formData.username : (profile?.username || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 border-border bg-background rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? formData.email : (profile?.email || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 border-border bg-background rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone : (profile?.phone || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-9 border-border bg-background rounded-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL Avatar</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="avatar_url"
                    value={isEditing ? formData.avatar_url : (profile?.avatar_url || '')}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-9 border-border bg-background rounded-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end gap-3 border-t pt-6">
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  className="bg-[#003f87] hover:bg-[#002f65]"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="bg-white border border-border shadow-sm rounded-sm">
            <CardHeader>
              <CardTitle className="text-[#003f87]">Role Kamu</CardTitle>
              <CardDescription>Role dan izin yang kamu miliki</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {profile?.roles && profile.roles.length > 0 ? (
                  profile.roles.map((role) => (
                    <Badge
                      key={role}
                      variant={role === activeRole ? "default" : "outline"}
                      className={`text-sm py-2 px-4 ${role === activeRole ? 'bg-[#003f87] text-white' : 'border-[#003f87] text-[#003f87]'}`}
                    >
                      {role === 'seller' && <StoreIcon className="h-4 w-4 mr-1" />}
                      {role === 'buyer' && <ShoppingBag className="h-4 w-4 mr-1" />}
                      {role === 'driver' && <Truck className="h-4 w-4 mr-1" />}
                      {role === 'admin' && <Shield className="h-4 w-4 mr-1" />}
                      <span className="capitalize">{role}</span>
                      {role === activeRole && <span className="ml-2 text-xs">(Aktif)</span>}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">Belum ada role yang ditetapkan.</p>
                )}
              </div>
              {profile?.roles && profile.roles.length > 1 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Kamu memiliki beberapa role. Ganti role aktif dari dashboard untuk mengakses fitur yang berbeda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-red-200 shadow-sm rounded-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
              <CardDescription>Tindakan berikut bersifat permanen dan tidak dapat dibatalkan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Hapus Akun</p>
                  <p className="text-sm text-muted-foreground">Hapus akun kamu secara permanen beserta semua data yang terkait.</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus Akun
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Hapus Akun?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data kamu akan dihapus secara permanen, termasuk pesanan, dompet, dan informasi toko.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghapus...
                </>
              ) : (
                'Ya, Hapus Akun'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
