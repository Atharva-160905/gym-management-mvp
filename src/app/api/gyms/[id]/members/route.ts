import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract gym ID from URL path: /api/gyms/[id]/members
    const gymId = request.nextUrl.pathname.split('/')[3];
    
    // Validate gym ID
    if (!gymId || isNaN(parseInt(gymId))) {
      return NextResponse.json({ 
        error: "Valid gym ID is required",
        code: "INVALID_GYM_ID" 
      }, { status: 400 });
    }

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query members with user details
    const gymMembers = await db
      .select({
        id: members.id,
        userId: members.userId,
        gymId: members.gymId,
        membershipPlan: members.membershipPlan,
        startDate: members.startDate,
        endDate: members.endDate,
        paymentStatus: members.paymentStatus,
        createdAt: members.createdAt,
        userEmail: users.email,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .where(eq(members.gymId, parseInt(gymId)))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(gymMembers, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}