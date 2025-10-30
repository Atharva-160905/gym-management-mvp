import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';

function calculateEndDate(startDate: string, membershipPlan: string): string {
  const start = new Date(startDate);
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
    default:
      daysToAdd = 30;
  }

  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + daysToAdd);
  return endDate.toISOString();
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingMember = await db
      .select()
      .from(members)
      .where(eq(members.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { userId, gymId, membershipPlan, startDate, endDate, paymentStatus } = body;

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (userId !== undefined) updates.userId = userId;
    if (gymId !== undefined) updates.gymId = gymId;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;

    const needsEndDateRecalculation = membershipPlan !== undefined || startDate !== undefined;

    if (needsEndDateRecalculation) {
      const finalStartDate = startDate || existingMember[0].startDate;
      const finalMembershipPlan = membershipPlan || existingMember[0].membershipPlan;

      updates.endDate = calculateEndDate(finalStartDate, finalMembershipPlan);

      if (startDate !== undefined) updates.startDate = startDate;
      if (membershipPlan !== undefined) updates.membershipPlan = membershipPlan;
    } else if (endDate !== undefined) {
      updates.endDate = endDate;
    }

    const updated = await db
      .update(members)
      .set(updates)
      .where(eq(members.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update member' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
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

    const existingMember = await db
      .select()
      .from(members)
      .where(eq(members.id, parseInt(id)))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(members)
      .where(eq(members.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete member' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Member deleted successfully', id: parseInt(id) },
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