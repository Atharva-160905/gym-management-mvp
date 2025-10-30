import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      gymId: users.gymId,
      createdAt: users.createdAt,
    }).from(users);

    if (search) {
      query = query.where(
        or(
          like(users.email, `%${search}%`),
          like(users.role, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, gymId } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required', code: 'MISSING_ROLE' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'gym_owner', 'member'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: `Role must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE',
        },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare insert data
    const insertData: {
      email: string;
      password: string;
      role: string;
      gymId?: number | null;
      createdAt: string;
    } = {
      email: sanitizedEmail,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    if (gymId !== undefined) {
      insertData.gymId = gymId;
    }

    // Insert user
    const newUser = await db
      .insert(users)
      .values(insertData)
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        gymId: users.gymId,
        createdAt: users.createdAt,
      });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);

    // Handle unique constraint violation for email
    if (
      error instanceof Error &&
      (error.message.includes('UNIQUE constraint failed') ||
        error.message.includes('unique'))
    ) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}