import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members, users } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const gymId = searchParams.get('gymId');
    const search = searchParams.get('search');

    let query = db
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
      .leftJoin(users, eq(members.userId, users.id));

    const conditions = [];

    if (gymId) {
      conditions.push(eq(members.gymId, parseInt(gymId)));
    }

    if (search) {
      conditions.push(
        or(
          like(members.membershipPlan, `%${search}%`),
          like(members.paymentStatus, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
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
    const { userId, gymId, membershipPlan, startDate, paymentStatus } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!gymId) {
      return NextResponse.json(
        { error: 'gymId is required', code: 'MISSING_GYM_ID' },
        { status: 400 }
      );
    }

    if (!membershipPlan) {
      return NextResponse.json(
        { error: 'membershipPlan is required', code: 'MISSING_MEMBERSHIP_PLAN' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'startDate is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    // Validate membershipPlan
    const validPlans = ['1_month', '3_months', '6_months'];
    if (!validPlans.includes(membershipPlan)) {
      return NextResponse.json(
        {
          error: 'membershipPlan must be one of: 1_month, 3_months, 6_months',
          code: 'INVALID_MEMBERSHIP_PLAN',
        },
        { status: 400 }
      );
    }

    // Calculate endDate based on membershipPlan
    let daysToAdd = 0;
    switch (membershipPlan) {
      case '1_month':
        daysToAdd = 30;
        break;
      case '3_months':
        daysToAdd = 90;
        break;
      case '6_months':
        daysToAdd = 180;
        break;
    }

    const endDate = new Date(
      new Date(startDate).getTime() + daysToAdd * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    // Create member object
    const newMember = await db
      .insert(members)
      .values({
        userId: parseInt(userId),
        gymId: parseInt(gymId),
        membershipPlan,
        startDate,
        endDate,
        paymentStatus: paymentStatus || 'unpaid',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMember[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}