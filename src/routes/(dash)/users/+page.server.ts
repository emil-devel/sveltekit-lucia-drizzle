import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { activeUserSchema, roleUserSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail, superValidate } from 'sveltekit-superforms';
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
				avatar: table.profile.avatar
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

export const actions: Actions = {
	active: async (event) => {
		const activeForm = await superValidate(event.request, valibot(activeUserSchema));
		const { id, active } = activeForm.data;

		if (!activeForm.valid) return fail(400, { activeForm });

		try {
			await db
				.update(table.user)
				.set({ active: active as boolean })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			setFlash({ type: 'error', message: error }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	},
	role: async (event) => {
		const roleForm = await superValidate(event.request, valibot(roleUserSchema));
		const { id, role } = roleForm.data;

		if (!roleForm.valid) return fail(400, { roleForm });

		try {
			await db
				.update(table.user)
				.set({ role: role as (typeof table.user.$inferInsert)['role'] })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			setFlash({ type: 'error', message: error }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	}
};
