import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const sampleUsers = [
        {
            email: 'superadmin@gymapp.com',
            password: await bcrypt.hash('Admin@123', 10),
            role: 'super_admin',
            gymId: null,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'owner1@gymapp.com',
            password: await bcrypt.hash('Owner@123', 10),
            role: 'gym_owner',
            gymId: 1,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'owner2@gymapp.com',
            password: await bcrypt.hash('Owner@123', 10),
            role: 'gym_owner',
            gymId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'member1@gymapp.com',
            password: await bcrypt.hash('Member@123', 10),
            role: 'member',
            gymId: 1,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'member2@gymapp.com',
            password: await bcrypt.hash('Member@123', 10),
            role: 'member',
            gymId: 1,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'member3@gymapp.com',
            password: await bcrypt.hash('Member@123', 10),
            role: 'member',
            gymId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            email: 'member4@gymapp.com',
            password: await bcrypt.hash('Member@123', 10),
            role: 'member',
            gymId: 2,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});