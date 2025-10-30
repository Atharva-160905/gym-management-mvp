"use client";

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Dumbbell, LogOut, Calendar, CreditCard, MapPin, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MemberData {
  id: number;
  userId: number;
  gymId: number;
  membershipPlan: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  userEmail: string;
  gymName: string;
  gymLocation: string;
}

function MemberDashboardContent() {
  const { user, logout } = useAuth();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchMemberData();
    }
  }, [user?.id]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/members/me?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setMemberData(data);
      } else {
        setError('Failed to load membership details');
      }
    } catch (err) {
      setError('Failed to load membership details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRemainingDays = () => {
    if (!memberData) return 0;
    const end = new Date(memberData.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateTotalDays = () => {
    if (!memberData) return 0;
    const start = new Date(memberData.startDate);
    const end = new Date(memberData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = () => {
    const total = calculateTotalDays();
    const remaining = calculateRemainingDays();
    const elapsed = total - remaining;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const remainingDays = calculateRemainingDays();
  const totalDays = calculateTotalDays();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold">Member Dashboard</h1>
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !memberData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No membership found. Please contact your gym.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-slate-800 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                <CardDescription className="text-base">
                  Here's your membership overview
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span className="font-semibold">
                      {remainingDays < 0 ? 'Expired' : `${remainingDays} of ${totalDays} days`}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {remainingDays < 7 && remainingDays >= 0 && (
                    <Alert className="bg-orange-50 border-orange-200 text-orange-900">
                      <AlertDescription>
                        Your membership is expiring soon! Please renew to continue enjoying our services.
                      </AlertDescription>
                    </Alert>
                  )}
                  {remainingDays < 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Your membership has expired. Please contact the gym to renew.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-semibold">
                        {new Date(memberData.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-semibold">
                        {new Date(memberData.endDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{memberData.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member ID</p>
                    <p className="font-medium">#{memberData.id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Gym Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Gym Name</p>
                    <p className="font-medium">{memberData.gymName}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{memberData.gymLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Membership Plan & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Membership Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {memberData.membershipPlan.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {totalDays} days total duration
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      memberData.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {memberData.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  {memberData.paymentStatus === 'unpaid' && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Please contact your gym to complete payment
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{remainingDays < 0 ? 0 : remainingDays}</p>
                    <p className="text-sm text-muted-foreground mt-1">Days Remaining</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{totalDays - (remainingDays < 0 ? totalDays : remainingDays)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Days Used</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{Math.round(progress)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Plan Progress</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{totalDays}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MemberDashboard() {
  return (
    <ProtectedRoute allowedRoles={['member']}>
      <MemberDashboardContent />
    </ProtectedRoute>
  );
}
