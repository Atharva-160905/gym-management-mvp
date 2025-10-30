import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gyms, members, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL pathname
    const id = request.nextUrl.pathname.split('/').pop();
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { name, location, ownerId } = body;

    // Check if gym exists
    const existingGym = await db.select()
      .from(gyms)
      .where(eq(gyms.id, parseInt(id)))
      .limit(1);

    if (existingGym.length === 0) {
      return NextResponse.json({ 
        error: "Gym not found" 
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (location !== undefined) {
      if (typeof location !== 'string' || location.trim() === '') {
        return NextResponse.json({ 
          error: "Location must be a non-empty string",
          code: "INVALID_LOCATION" 
        }, { status: 400 });
      }
      updates.location = location.trim();
    }

    if (ownerId !== undefined) {
      if (ownerId !== null && (typeof ownerId !== 'number' || isNaN(ownerId))) {
        return NextResponse.json({ 
          error: "Owner ID must be a valid number or null",
          code: "INVALID_OWNER_ID" 
        }, { status: 400 });
      }
      updates.ownerId = ownerId;
    }

    // Update gym
    const updatedGym = await db.update(gyms)
      .set(updates)
      .where(eq(gyms.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedGym[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
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

    const gymId = parseInt(id);

    // Check if gym exists
    const existingGym = await db
      .select()
      .from(gyms)
      .where(eq(gyms.id, gymId))
      .limit(1);

    if (existingGym.length === 0) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      );
    }

    // Delete all members associated with this gym
    await db.delete(members).where(eq(members.gymId, gymId));

    // Update users to remove gym association
    await db.update(users)
      .set({ gymId: null })
      .where(eq(users.gymId, gymId));

    // Delete the gym
    const deleted = await db
      .delete(gyms)
      .where(eq(gyms.id, gymId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete gym' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Gym deleted successfully', id: gymId },
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