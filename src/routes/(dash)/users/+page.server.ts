import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { updateUserSchema } from '$lib/valibot';
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
	const form = await superValidate(event, valibot(updateUserSchema));

	return {
		users: await getUsers(),
		form
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event.request, valibot(updateUserSchema));
		const { id, username } = form.data;

		const user = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, username as string));

		if (user.at(0)) {
			setFlash({ type: 'warning', message: `User ${username} already exists!` }, event.cookies);
			return;
		}

		await db
			.update(table.user)
			.set({ username: username as string })
			.where(eq(table.user.id, id as string));

		setFlash({ type: 'success', message: `User ${username} updated.` }, event.cookies);
	},
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id');

		await db.delete(table.user).where(eq(table.user.id, id as string));

		return { success: true };
	}
};
