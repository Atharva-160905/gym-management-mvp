import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({
        error: 'Password is required',
        code: 'MISSING_PASSWORD'
      }, { status: 400 });
    }

    // Sanitize email input
    const sanitizedEmail = email.trim().toLowerCase();

    // Query user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    // Check if user exists
    if (userResult.length === 0) {
      return NextResponse.json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }

    const user = userResult[0];

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }

    // Return user data without password
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}