import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'sveltekit-flash-message/server';
import { asc } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');

	const getUsers = async () => {
		const result = await db
			.select({
				id: table.user.id,
				active: table.user.active,
				role: table.user.role,
				username: table.user.username,
				createdAt: table.user.createdAt,
				avatar: table.profile.avatar,
				firstName: table.profile.firstName,
				lastName: table.profile.lastName
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.user.id, table.profile.userId))
			.orderBy(asc(table.user.username));

		const users = result.map((result) => ({
			...result,
			createdAt: result.createdAt.toLocaleDateString()
		}));

		return users;
	};

	return {
		users: await getUsers()
	};
}) satisfies PageServerLoad;
