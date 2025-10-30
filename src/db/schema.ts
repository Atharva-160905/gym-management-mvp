import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Gyms table
export const gyms = sqliteTable('gyms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location').notNull(),
  ownerId: integer('owner_id'),
  createdAt: text('created_at').notNull(),
});

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  gymId: integer('gym_id').references(() => gyms.id),
  createdAt: text('created_at').notNull(),
});

// Members table
export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  gymId: integer('gym_id').notNull().references(() => gyms.id),
  membershipPlan: text('membership_plan').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  paymentStatus: text('payment_status').notNull().default('unpaid'),
  createdAt: text('created_at').notNull(),
});