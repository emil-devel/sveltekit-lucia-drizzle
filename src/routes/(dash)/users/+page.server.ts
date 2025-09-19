import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { activeUserSchema, roleUserSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { desc } from 'drizzle-orm';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');

	const getUsers = async () => {
		const usersRaw = await db
			.select({
				id: table.user.id,
				active: table.user.active,
				role: table.user.role,
				username: table.user.username,
				email: table.user.email,
				updatedAt: table.user.updatedAt,
				createdAt: table.user.createdAt,
				avatar: table.profile.avatar,
				lastName: table.profile.lastName
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.user.id, table.profile.userId))
			.orderBy(desc(table.user.updatedAt));
		const users = usersRaw.map((u) => ({
			...u,
			updatedAt: u.updatedAt.toLocaleDateString(),
			createdAt: u.createdAt.toLocaleDateString()
		}));
		return users;
	};
	const activeForm = await superValidate(event, valibot(activeUserSchema));
	const roleForm = await superValidate(event, valibot(roleUserSchema));

	return {
		users: await getUsers(),
		activeForm,
		roleForm
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	active: async (event) => {
		const updateForm = await superValidate(event.request, valibot(activeUserSchema));
		const { id, active } = updateForm.data;

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
