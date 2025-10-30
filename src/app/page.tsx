"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Dumbbell, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Dumbbell className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Gym Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your gym operations with our comprehensive management platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Super Admin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Shield className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
              <CardTitle>Super Admin</CardTitle>
              <CardDescription>
                Manage gyms, owners, and oversee the entire system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login/admin">
                <Button className="w-full" variant="default">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gym Owner Card */}
          <Card className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950">
                  <Dumbbell className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Gym Owner</CardTitle>
              <CardDescription>
                Manage members, plans, and track memberships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login/owner">
                <Button className="w-full" variant="default">
                  Owner Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Member Card */}
          <Card className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-950">
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Member</CardTitle>
              <CardDescription>
                View your profile and membership details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login/member">
                <Button className="w-full" variant="default">
                  Member Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Secure login portals for admins, gym owners, and members
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gym Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage multiple gym locations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Member Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track memberships, plans, and expiration dates
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Payment Status</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor payment status and membership validity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-center">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-1">Super Admin:</p>
                <p className="text-sm text-muted-foreground">Email: superadmin@gymapp.com</p>
                <p className="text-sm text-muted-foreground">Password: Admin@123</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Gym Owner:</p>
                <p className="text-sm text-muted-foreground">Email: owner1@gymapp.com</p>
                <p className="text-sm text-muted-foreground">Password: Owner@123</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Member:</p>
                <p className="text-sm text-muted-foreground">Email: member1@gymapp.com</p>
                <p className="text-sm text-muted-foreground">Password: Member@123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}