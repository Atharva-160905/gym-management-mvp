import { db } from '@/db';
import { members } from '@/db/schema';

async function main() {
    const today = new Date();
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const fifteenDaysFromNow = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysFromNow = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const sampleMembers = [
        {
            userId: 4,
            gymId: 1,
            membershipPlan: '3_months',
            startDate: today.toISOString().split('T')[0],
            endDate: ninetyDaysFromNow.toISOString().split('T')[0],
            paymentStatus: 'paid',
            createdAt: today.toISOString(),
        },
        {
            userId: 5,
            gymId: 1,
            membershipPlan: '1_month',
            startDate: fifteenDaysAgo.toISOString().split('T')[0],
            endDate: fifteenDaysFromNow.toISOString().split('T')[0],
            paymentStatus: 'paid',
            createdAt: fifteenDaysAgo.toISOString(),
        },
        {
            userId: 6,
            gymId: 2,
            membershipPlan: '6_months',
            startDate: today.toISOString().split('T')[0],
            endDate: oneEightyDaysFromNow.toISOString().split('T')[0],
            paymentStatus: 'paid',
            createdAt: today.toISOString(),
        },
        {
            userId: 7,
            gymId: 2,
            membershipPlan: '1_month',
            startDate: twentyDaysAgo.toISOString().split('T')[0],
            endDate: tenDaysFromNow.toISOString().split('T')[0],
            paymentStatus: 'unpaid',
            createdAt: twentyDaysAgo.toISOString(),
        }
    ];

    await db.insert(members).values(sampleMembers);
    
    console.log('✅ Members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});