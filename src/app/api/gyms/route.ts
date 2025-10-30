import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gyms } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const ownerIdParam = searchParams.get('ownerId');

    let query = db.select().from(gyms);

    const conditions = [];

    // Add ownerId filter if provided
    if (ownerIdParam) {
      const ownerId = parseInt(ownerIdParam);
      if (!isNaN(ownerId)) {
        conditions.push(eq(gyms.ownerId, ownerId));
      }
    }

    // Add search filter if provided
    if (search) {
      conditions.push(
        or(
          like(gyms.name, `%${search}%`),
          like(gyms.location, `%${search}%`)
        )
      );
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, ownerId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedLocation = location.trim();

    // Validate sanitized inputs are not empty
    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (sanitizedLocation.length === 0) {
      return NextResponse.json(
        { error: 'Location cannot be empty', code: 'INVALID_LOCATION' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: {
      name: string;
      location: string;
      ownerId?: number;
      createdAt: string;
    } = {
      name: sanitizedName,
      location: sanitizedLocation,
      createdAt: new Date().toISOString(),
    };

    // Add ownerId if provided and valid
    if (ownerId !== undefined && ownerId !== null) {
      const parsedOwnerId = parseInt(String(ownerId));
      if (!isNaN(parsedOwnerId)) {
        insertData.ownerId = parsedOwnerId;
      }
    }

    const newGym = await db.insert(gyms)
      .values(insertData)
      .returning();

    return NextResponse.json(newGym[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}