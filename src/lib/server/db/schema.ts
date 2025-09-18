import { pgTable, text, timestamp, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('Role', ['USER', 'REDACTEUR', 'ADMIN']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	active: boolean('active').default(false).notNull(),
	role: roleEnum('role').default('USER').notNull(),
	username: text('username').notNull().unique(),
	email: text('email').unique().notNull(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const profile = pgTable('profile', {
	id: uuid('id').defaultRandom().primaryKey(),
	avatar: text('avatar'),
	firstName: text('firstName'),
	lastName: text('lastName'),
	phone: text('phone'),
	bio: text('bio'),
	userId: text('user_id')
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' })
		.notNull(),
	name: text('name')
		.references(() => user.username, { onUpdate: 'cascade' })
		.notNull()
});

export const profileRelations = relations(profile, ({ one }) => ({
	user: one(user, { fields: [profile.userId, profile.name], references: [user.id, user.username] })
}));

export type Profile = typeof profile.$inferSelect;

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
