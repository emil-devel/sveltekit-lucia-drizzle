import type { Actions, PageServerLoad } from './$types';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, not } from 'drizzle-orm';

import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { isAdmin, isSelf } from '$lib/permissions';

import { valibot } from 'sveltekit-superforms/adapters';
import {
	activeUserSchema,
	roleUserSchema,
	userNameSchema,
	userIdSchema,
	userEmailSchema
} from '$lib/valibot';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');

	const getUser = async (username: string) => {
		// Single round-trip: user + profile via LEFT JOIN (profile expected to exist, but we guard anyway)
		const users = await db
			.select({
				userId: table.user.id,
				active: table.user.active,
				role: table.user.role,
				username: table.user.username,
				email: table.user.email,
				updatedAt: table.user.updatedAt,
				createdAt: table.user.createdAt,
				profileId: table.profile.id,
				avatar: table.profile.avatar,
				firstName: table.profile.firstName,
				lastName: table.profile.lastName
			})
			.from(table.user)
			.leftJoin(table.profile, eq(table.profile.name, table.user.username))
			.where(eq(table.user.username, username))
			.limit(1);

		const user = users[0];
		if (!user) throw redirect(302, '/users');
		if (!user.profileId) throw redirect(302, '/users'); // invariant: profile should exist

		const uName = user.username;
		const uEmail = user.email;
		const uActive = user.active;
		const uRole = user.role;
		const id = user.userId;
		const { updatedAt, createdAt } = user;

		const normalizedProfile = {
			id: user.profileId,
			avatar: user.avatar ?? '',
			firstName: user.firstName ?? '',
			lastName: user.lastName ?? ''
		};

		const [usernameForm, emailForm, activeForm, roleForm, deleteForm] = await Promise.all([
			superValidate({ id, username: uName }, valibot(userNameSchema)),
			superValidate({ id, email: uEmail }, valibot(userEmailSchema)),
			superValidate({ id, active: uActive }, valibot(activeUserSchema)),
			superValidate({ id, role: uRole }, valibot(roleUserSchema)),
			superValidate({ id }, valibot(userIdSchema))
		]);

		return {
			id,
			usernameForm,
			emailForm,
			activeForm,
			roleForm,
			deleteForm,
			updatedAt: updatedAt.toLocaleDateString(),
			createdAt: createdAt.toLocaleDateString(),
			avatar: normalizedProfile.avatar,
			firstName: normalizedProfile.firstName,
			lastName: normalizedProfile.lastName
		};
	};

	return await getUser(event.params.username);
}) satisfies PageServerLoad;

export const actions: Actions = {
	username: async (event) => {
		const usernameForm = await superValidate(event.request, valibot(userNameSchema));
		const { id, username } = usernameForm.data;

		if (!usernameForm.valid) return fail(400, { usernameForm });

		// Authz: self or admin can change username
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		if (!(isAdmin(viewer) || isSelf(viewer.id, id))) {
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);
		}

		const res = await db
			.select({ username: table.user.username })
			.from(table.user)
			.where(and(eq(table.user.username, username), not(eq(table.user.id, id))));
		if (username === res[0]?.username)
			return setError(usernameForm, 'username', 'Username already exist!');

		try {
			await db.update(table.user).set({ username }).where(eq(table.user.id, id));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		redirect('/users', { type: 'success', message: 'Username updated.' }, event.cookies);
	},
	email: async (event) => {
		const emailForm = await superValidate(event.request, valibot(userEmailSchema));
		const { id, email } = emailForm.data;

		if (!emailForm.valid) return fail(400, { emailForm });

		// Authz: self or admin can change email
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		if (!(isAdmin(viewer) || isSelf(viewer.id, id))) {
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);
		}

		const res = await db
			.select({ email: table.user.email })
			.from(table.user)
			.where(and(eq(table.user.email, email), not(eq(table.user.id, id))));
		if (email === res[0]?.email) return setError(emailForm, 'email', 'Email already in use!');

		try {
			await db.update(table.user).set({ email }).where(eq(table.user.id, id));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `Email updated.` }, event.cookies);
	},
	active: async (event) => {
		const activeForm = await superValidate(event.request, valibot(activeUserSchema));
		const { id, active } = activeForm.data;

		if (!activeForm.valid) return fail(400, { activeForm });

		// Authz: only admin can toggle active and cannot target self
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		if (!isAdmin(viewer) || isSelf(viewer.id, id)) {
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);
		}

		try {
			await db
				.update(table.user)
				.set({ active: active as boolean })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	},
	role: async (event) => {
		const roleForm = await superValidate(event.request, valibot(roleUserSchema));
		const { id, role } = roleForm.data;

		if (!roleForm.valid) return fail(400, { roleForm });

		// Authz: only admin can change role and cannot target self
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		if (!isAdmin(viewer) || isSelf(viewer.id, id)) {
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);
		}

		try {
			await db
				.update(table.user)
				.set({ role: role })
				.where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: `User updated.` }, event.cookies);
	},
	delete: async (event) => {
		const deleteForm = await superValidate(event.request, valibot(userIdSchema));
		const { id } = deleteForm.data;

		if (!deleteForm.valid) return fail(400, { deleteForm });

		// Authz: only admin can delete and cannot delete self
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		if (!isAdmin(viewer) || isSelf(viewer.id, id)) {
			return setFlash({ type: 'error', message: 'Not authorized.' }, event.cookies);
		}

		try {
			await db.delete(table.user).where(eq(table.user.id, id as string));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		redirect('/users', { type: 'success', message: 'User deleted!' }, event.cookies);
	}
};
