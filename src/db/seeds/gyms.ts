import { db } from '@/db';
import { gyms } from '@/db/schema';

async function main() {
    const sampleGyms = [
        {
            name: 'FitZone Gym',
            location: 'New York, NY',
            ownerId: null,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'PowerHouse Fitness',
            location: 'Los Angeles, CA',
            ownerId: null,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(gyms).values(sampleGyms);
    
    console.log('✅ Gyms seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});