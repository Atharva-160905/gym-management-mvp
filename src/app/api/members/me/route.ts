import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members, users, gyms } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query member with user and gym details
    const memberData = await db
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
        gymName: gyms.name,
        gymLocation: gyms.location,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .innerJoin(gyms, eq(members.gymId, gyms.id))
      .where(eq(members.userId, parseInt(userId)))
      .limit(1);

    if (memberData.length === 0) {
      return NextResponse.json(
        { 
          error: 'Member not found',
          code: 'MEMBER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(memberData[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}