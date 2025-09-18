import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { deleteUserSchema, updateUserSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');

	const getUsers = async () => {
		const result = await db.query.user.findMany();
		return result;
	};
	const updateForm = await superValidate(event, valibot(updateUserSchema));
	const deleteForm = await superValidate(event, valibot(deleteUserSchema));

	return {
		users: await getUsers(),
		updateForm,
		deleteForm
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {
		const updateForm = await superValidate(event.request, valibot(updateUserSchema));
		const { id, username } = updateForm.data;

		await db
			.update(table.user)
			.set({ username: username as string })
			.where(eq(table.user.id, id as string));

		setFlash({ type: 'success', message: `User ${username} updated.` }, event.cookies);
	},
	delete: async (event) => {
		const deleteForm = await superValidate(event.request, valibot(deleteUserSchema));
		const { id } = deleteForm.data;

		await db.delete(table.user).where(eq(table.user.id, id as string));

		return { success: true };
	}
};
