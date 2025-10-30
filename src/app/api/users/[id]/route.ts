import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL path
    const id = request.nextUrl.pathname.split('/').pop();
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const userId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { email, password, role, gymId } = body;

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (password !== undefined) {
      // Validate password strength
      if (password.length < 6) {
        return NextResponse.json({ 
          error: "Password must be at least 6 characters",
          code: "WEAK_PASSWORD" 
        }, { status: 400 });
      }
      // Hash the password
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      // Validate role
      const validRoles = ['admin', 'gym_owner', 'member'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ 
          error: "Invalid role. Must be one of: admin, gym_owner, member",
          code: "INVALID_ROLE" 
        }, { status: 400 });
      }
      updateData.role = role;
    }

    if (gymId !== undefined) {
      updateData.gymId = gymId;
    }

    // Update user
    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting super admin
    if (existingUser[0].role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin account' },
        { status: 403 }
      );
    }

    // Delete all member records associated with this user
    await db.delete(members).where(eq(members.userId, userId));

    // Delete the user
    const deleted = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully', id: userId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}