"use client";

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, UserPlus, LogOut, Users, Dumbbell, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Gym {
  id: number;
  name: string;
  location: string;
  ownerId: number | null;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  gymId: number | null;
  createdAt: string;
}

interface Member {
  id: number;
  userId: number;
  gymId: number;
  membershipPlan: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  userEmail: string;
}

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGymMembers, setSelectedGymMembers] = useState<Member[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Form states
  const [isAddGymOpen, setIsAddGymOpen] = useState(false);
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [isEditGymOpen, setIsEditGymOpen] = useState(false);
  const [isEditOwnerOpen, setIsEditOwnerOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gym form
  const [gymName, setGymName] = useState('');
  const [gymLocation, setGymLocation] = useState('');
  const [gymOwnerId, setGymOwnerId] = useState('');
  const [editingGymId, setEditingGymId] = useState<number | null>(null);

  // Owner form
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerGymId, setOwnerGymId] = useState('');
  const [editingOwnerId, setEditingOwnerId] = useState<number | null>(null);

  useEffect(() => {
    fetchGyms();
    fetchUsers();
  }, []);

  const fetchGyms = async () => {
    try {
      const response = await fetch('/api/gyms');
      if (response.ok) {
        const data = await response.json();
        setGyms(data);
      }
    } catch (err) {
      console.error('Failed to fetch gyms:', err);
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Add cache-busting timestamp to prevent stale data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/users?limit=1000&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchGymMembers = async (gymId: number) => {
    setIsLoadingMembers(true);
    try {
      const response = await fetch(`/api/gyms/${gymId}/members`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGymMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch gym members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/gyms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gymName,
          location: gymLocation,
          ownerId: gymOwnerId && gymOwnerId !== 'none' ? parseInt(gymOwnerId) : null,
        }),
      });

      if (response.ok) {
        setSuccess('Gym created successfully!');
        setGymName('');
        setGymLocation('');
        setGymOwnerId('');
        setIsAddGymOpen(false);
        fetchGyms();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create gym');
      }
    } catch (err) {
      setError('Failed to create gym');
    }
  };

  const handleEditGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingGymId) return;

    try {
      const response = await fetch(`/api/gyms/${editingGymId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gymName,
          location: gymLocation,
          ownerId: gymOwnerId && gymOwnerId !== 'none' ? parseInt(gymOwnerId) : null,
        }),
      });

      if (response.ok) {
        setSuccess('Gym updated successfully!');
        setGymName('');
        setGymLocation('');
        setGymOwnerId('');
        setEditingGymId(null);
        setIsEditGymOpen(false);
        fetchGyms();
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update gym');
      }
    } catch (err) {
      setError('Failed to update gym');
    }
  };

  const openEditGymDialog = (gym: Gym) => {
    setEditingGymId(gym.id);
    setGymName(gym.name);
    setGymLocation(gym.location);
    setGymOwnerId(gym.ownerId ? gym.ownerId.toString() : 'none');
    setIsEditGymOpen(true);
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmail,
          password: ownerPassword,
          role: 'gym_owner',
          gymId: ownerGymId && ownerGymId !== 'none' ? parseInt(ownerGymId) : null,
        }),
      });

      if (response.ok) {
        setSuccess('Gym owner created successfully!');
        setOwnerEmail('');
        setOwnerPassword('');
        setOwnerGymId('');
        setIsAddOwnerOpen(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create gym owner');
      }
    } catch (err) {
      setError('Failed to create gym owner');
    }
  };

  const handleEditOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingOwnerId) return;

    try {
      const updateData: any = {
        email: ownerEmail,
        gymId: ownerGymId && ownerGymId !== 'none' ? parseInt(ownerGymId) : null,
      };

      // Only include password if it's provided
      if (ownerPassword.trim()) {
        updateData.password = ownerPassword;
      }

      const response = await fetch(`/api/users/${editingOwnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Gym owner updated successfully!');
        setOwnerEmail('');
        setOwnerPassword('');
        setOwnerGymId('');
        setEditingOwnerId(null);
        setIsEditOwnerOpen(false);
        fetchUsers();
        fetchGyms();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update gym owner');
      }
    } catch (err) {
      setError('Failed to update gym owner');
    }
  };

  const openEditOwnerDialog = (owner: User) => {
    setEditingOwnerId(owner.id);
    setOwnerEmail(owner.email);
    setOwnerPassword(''); // Don't pre-fill password
    setOwnerGymId(owner.gymId ? owner.gymId.toString() : 'none');
    setIsEditOwnerOpen(true);
  };

  const handleDeleteGym = async (gymId: number) => {
    if (!confirm('Are you sure you want to delete this gym? This will also remove all associated members.')) {
      return;
    }

    try {
      const response = await fetch(`/api/gyms/${gymId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Gym deleted successfully!');
        fetchGyms();
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete gym');
      }
    } catch (err) {
      setError('Failed to delete gym');
    }
  };

  const handleDeleteOwner = async (ownerId: number) => {
    if (!confirm('Are you sure you want to delete this gym owner?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${ownerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Gym owner deleted successfully!');
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete gym owner');
      }
    } catch (err) {
      setError('Failed to delete gym owner');
    }
  };

  const gymOwners = users.filter(u => u.role === 'gym_owner');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gyms.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gym Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gymOwners.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gyms Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gyms Management</CardTitle>
                <CardDescription>Manage all gyms in the system</CardDescription>
              </div>
              <Dialog open={isAddGymOpen} onOpenChange={setIsAddGymOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Gym
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Gym</DialogTitle>
                    <DialogDescription>Create a new gym in the system</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddGym} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gymName">Gym Name</Label>
                      <Input
                        id="gymName"
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="Enter gym name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gymLocation">Location</Label>
                      <Input
                        id="gymLocation"
                        value={gymLocation}
                        onChange={(e) => setGymLocation(e.target.value)}
                        placeholder="Enter location"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gymOwnerId">Assign Owner (Optional)</Label>
                      <Select value={gymOwnerId} onValueChange={setGymOwnerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No owner</SelectItem>
                          {gymOwners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id.toString()}>
                              {owner.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Create Gym</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingGyms ? (
              <div className="text-center py-8">Loading gyms...</div>
            ) : gyms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No gyms found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gyms.map((gym) => {
                    const owner = users.find(u => u.id === gym.ownerId);
                    return (
                      <TableRow key={gym.id}>
                        <TableCell className="font-medium">{gym.name}</TableCell>
                        <TableCell>{gym.location}</TableCell>
                        <TableCell>{owner?.email || 'No owner'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                fetchGymMembers(gym.id);
                                setIsViewMembersOpen(true);
                              }}
                            >
                              View Members
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditGymDialog(gym)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteGym(gym.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Gym Owners Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gym Owners</CardTitle>
                <CardDescription>Manage gym owner accounts</CardDescription>
              </div>
              <Dialog open={isAddOwnerOpen} onOpenChange={setIsAddOwnerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Owner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Gym Owner</DialogTitle>
                    <DialogDescription>Create a new gym owner account</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddOwner} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Email</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="owner@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerPassword">Password</Label>
                      <Input
                        id="ownerPassword"
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerGymId">Assign to Gym (Optional)</Label>
                      <Select value={ownerGymId} onValueChange={setOwnerGymId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gym" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No gym</SelectItem>
                          {gyms.map((gym) => (
                            <SelectItem key={gym.id} value={gym.id.toString()}>
                              {gym.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Create Owner</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="text-center py-8">Loading users...</div>
            ) : gymOwners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No gym owners found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Gym</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gymOwners.map((owner) => {
                    const gym = gyms.find(g => g.id === owner.gymId);
                    return (
                      <TableRow key={owner.id}>
                        <TableCell className="font-medium">{owner.email}</TableCell>
                        <TableCell>{gym?.name || 'Not assigned'}</TableCell>
                        <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditOwnerDialog(owner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOwner(owner.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Gym Dialog */}
        <Dialog open={isEditGymOpen} onOpenChange={setIsEditGymOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gym</DialogTitle>
              <DialogDescription>Update gym information and owner assignment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditGym} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editGymName">Gym Name</Label>
                <Input
                  id="editGymName"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="Enter gym name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGymLocation">Location</Label>
                <Input
                  id="editGymLocation"
                  value={gymLocation}
                  onChange={(e) => setGymLocation(e.target.value)}
                  placeholder="Enter location"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGymOwnerId">Assign Owner</Label>
                <Select value={gymOwnerId} onValueChange={setGymOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No owner</SelectItem>
                    {gymOwners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id.toString()}>
                        {owner.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Gym</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Owner Dialog */}
        <Dialog open={isEditOwnerOpen} onOpenChange={setIsEditOwnerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gym Owner</DialogTitle>
              <DialogDescription>Update gym owner information and gym assignment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditOwner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editOwnerEmail">Email</Label>
                <Input
                  id="editOwnerEmail"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOwnerPassword">Password (leave blank to keep current)</Label>
                <Input
                  id="editOwnerPassword"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Enter new password (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOwnerGymId">Assign to Gym</Label>
                <Select value={ownerGymId} onValueChange={setOwnerGymId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gym" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No gym</SelectItem>
                    {gyms.map((gym) => (
                      <SelectItem key={gym.id} value={gym.id.toString()}>
                        {gym.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Owner</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Members Dialog */}
        <Dialog open={isViewMembersOpen} onOpenChange={setIsViewMembersOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Gym Members</DialogTitle>
              <DialogDescription>View all members of this gym</DialogDescription>
            </DialogHeader>
            {isLoadingMembers ? (
              <div className="text-center py-8">Loading members...</div>
            ) : selectedGymMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No members found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGymMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.userEmail}</TableCell>
                      <TableCell>{member.membershipPlan.replace('_', ' ')}</TableCell>
                      <TableCell>{new Date(member.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(member.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          member.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.paymentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}