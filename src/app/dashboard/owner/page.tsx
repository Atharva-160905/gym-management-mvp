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
import { Dumbbell, LogOut, UserPlus, Search, Trash2, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
  id: number;
  userId: number;
  gymId: number;
  membershipPlan: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  userEmail: string;
  createdAt: string;
}

interface Gym {
  id: number;
  name: string;
  location: string;
}

function OwnerDashboardContent() {
  const { user, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'plan' | 'endDate'>('email');
  
  // Form states
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [membershipPlan, setMembershipPlan] = useState('1_month');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  useEffect(() => {
    if (user?.gymId) {
      fetchGymDetails();
      fetchMembers();
    }
  }, [user?.gymId]);

  useEffect(() => {
    filterAndSortMembers();
  }, [members, searchTerm, sortBy]);

  const fetchGymDetails = async () => {
    try {
      const response = await fetch(`/api/gyms?limit=1&ownerId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setGym(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch gym details:', err);
    }
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/members?gymId=${user?.gymId}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortMembers = () => {
    let filtered = [...members];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.membershipPlan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'email':
          return a.userEmail.localeCompare(b.userEmail);
        case 'plan':
          return a.membershipPlan.localeCompare(b.membershipPlan);
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredMembers(filtered);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user?.gymId) {
      setError('No gym assigned to your account');
      return;
    }

    try {
      // First create the user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberEmail,
          password: memberPassword,
          role: 'member',
          gymId: user.gymId,
        }),
      });

      if (!userResponse.ok) {
        const data = await userResponse.json();
        setError(data.error || 'Failed to create member user');
        return;
      }

      const newUser = await userResponse.json();

      // Then create the member record
      const memberResponse = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser.id,
          gymId: user.gymId,
          membershipPlan,
          startDate,
          paymentStatus,
        }),
      });

      if (memberResponse.ok) {
        setSuccess('Member added successfully!');
        setMemberEmail('');
        setMemberPassword('');
        setMembershipPlan('1_month');
        setStartDate(new Date().toISOString().split('T')[0]);
        setPaymentStatus('unpaid');
        setIsAddMemberOpen(false);
        fetchMembers();
      } else {
        const data = await memberResponse.json();
        setError(data.error || 'Failed to create member');
      }
    } catch (err) {
      setError('Failed to add member');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Member removed successfully!');
        fetchMembers();
      } else {
        setError('Failed to remove member');
      }
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const handleTogglePaymentStatus = async (memberId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: newStatus,
        }),
      });

      if (response.ok) {
        setSuccess(`Payment status updated to ${newStatus}!`);
        fetchMembers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update payment status');
      }
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Gym Owner Dashboard</h1>
            </div>
            {gym && (
              <p className="text-sm text-muted-foreground mt-1">
                {gym.name} - {gym.location}
              </p>
            )}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => calculateRemainingDays(m.endDate) > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paid Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.paymentStatus === 'paid').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle>Members Management</CardTitle>
                <CardDescription>Manage your gym members</CardDescription>
              </div>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                    <DialogDescription>Create a new member account</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="member@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberPassword">Password</Label>
                      <Input
                        id="memberPassword"
                        type="password"
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="membershipPlan">Membership Plan</Label>
                      <Select value={membershipPlan} onValueChange={setMembershipPlan}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1_month">1 Month</SelectItem>
                          <SelectItem value="3_months">3 Months</SelectItem>
                          <SelectItem value="6_months">6 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Add Member</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Sort by Email</SelectItem>
                    <SelectItem value="plan">Sort by Plan</SelectItem>
                    <SelectItem value="endDate">Sort by End Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No members match your search' : 'No members found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Remaining Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => {
                      const remainingDays = calculateRemainingDays(member.endDate);
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.userEmail}</TableCell>
                          <TableCell>{member.membershipPlan.replace('_', ' ')}</TableCell>
                          <TableCell>{new Date(member.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(member.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${
                              remainingDays < 0 ? 'text-red-600' : 
                              remainingDays < 7 ? 'text-orange-600' : 
                              'text-green-600'
                            }`}>
                              {remainingDays < 0 ? 'Expired' : `${remainingDays} days`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`px-2 py-1 rounded text-xs ${
                                member.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              onClick={() => handleTogglePaymentStatus(member.id, member.paymentStatus)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              {member.paymentStatus}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['gym_owner']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}