import type { Actions, PageServerLoad } from './$types';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { isAdmin } from '$lib/permissions';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { profileSchema } from '$lib/valibot';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');
	const viewer = event.locals.authUser;
	// Allow access if admin or this is the user's own profile
	if (!(isAdmin(viewer) || viewer.username === event.params.username)) {
		throw redirect(302, '/users');
	}

	const getProfileForms = async (username: string) => {
		// Resolve user by username
		const users = await db
			.select({ id: table.user.id, username: table.user.username })
			.from(table.user)
			.where(eq(table.user.username, username))
			.limit(1);
		const userRow = users[0];
		if (!userRow) throw redirect(302, '/users');

		// Fetch profile by userId (deterministic row choice)
		const profiles = await db
			.select({
				id: table.profile.id,
				name: table.profile.name,
				userId: table.profile.userId,
				avatar: table.profile.avatar,
				firstName: table.profile.firstName,
				lastName: table.profile.lastName,
				phone: table.profile.phone,
				bio: table.profile.bio
			})
			.from(table.profile)
			.where(eq(table.profile.userId, userRow.id))
			.orderBy(asc(table.profile.id))
			.limit(1);
		const row = profiles[0];
		if (!row) throw redirect(302, '/users');

		const profile = {
			...row,
			avatar: row.avatar ?? '',
			firstName: row.firstName ?? '',
			lastName: row.lastName ?? '',
			phone: row.phone ?? '',
			bio: row.bio ?? ''
		};

		const [profileForm, avatarForm, firstNameForm, lastNameForm, phoneForm, bioForm] =
			await Promise.all([
				superValidate(profile, valibot(profileSchema)),
				superValidate({ id: profile.id, avatar: profile.avatar }, valibot(profileSchema)),
				superValidate({ id: profile.id, firstName: profile.firstName }, valibot(profileSchema)),
				superValidate({ id: profile.id, lastName: profile.lastName }, valibot(profileSchema)),
				superValidate({ id: profile.id, phone: profile.phone }, valibot(profileSchema)),
				superValidate({ id: profile.id, bio: profile.bio }, valibot(profileSchema))
			]);

		return { profileForm, avatarForm, firstNameForm, lastNameForm, phoneForm, bioForm };
	};

	return { form: await getProfileForms(event.params.username) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	avatar: async (event) => {
		const avatarForm = await superValidate(event.request, valibot(profileSchema));
		if (!avatarForm.valid) return fail(400, { avatarForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, avatar } = avatarForm.data;
		const targets = await db
			.select({ userId: table.profile.userId })
			.from(table.profile)
			.where(eq(table.profile.id, id))
			.limit(1);
		const targetUserId = targets[0]?.userId;
		if (!(isAdmin(viewer) || viewer.id === targetUserId)) return fail(403, { avatarForm });

		await db
			.update(table.profile)
			.set({ avatar: avatar ?? null })
			.where(eq(table.profile.id, id));
		setFlash({ type: 'success', message: 'Avatar updated.' }, event.cookies);
	},
	firstName: async (event) => {
		const firstNameForm = await superValidate(event.request, valibot(profileSchema));
		if (!firstNameForm.valid) return fail(400, { firstNameForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, firstName } = firstNameForm.data;
		const targets = await db
			.select({ userId: table.profile.userId })
			.from(table.profile)
			.where(eq(table.profile.id, id))
			.limit(1);
		const targetUserId = targets[0]?.userId;
		if (!(isAdmin(viewer) || viewer.id === targetUserId)) return fail(403, { firstNameForm });

		await db
			.update(table.profile)
			.set({ firstName: firstName ?? null })
			.where(eq(table.profile.id, id));
		setFlash({ type: 'success', message: 'First name updated.' }, event.cookies);
	},
	lastName: async (event) => {
		const lastNameForm = await superValidate(event.request, valibot(profileSchema));
		if (!lastNameForm.valid) return fail(400, { lastNameForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, lastName } = lastNameForm.data;
		const targets = await db
			.select({ userId: table.profile.userId })
			.from(table.profile)
			.where(eq(table.profile.id, id))
			.limit(1);
		const targetUserId = targets[0]?.userId;
		if (!(isAdmin(viewer) || viewer.id === targetUserId)) return fail(403, { lastNameForm });

		await db
			.update(table.profile)
			.set({ lastName: lastName ?? null })
			.where(eq(table.profile.id, id));
		setFlash({ type: 'success', message: 'Last name updated.' }, event.cookies);
	},
	phone: async (event) => {
		const phoneForm = await superValidate(event.request, valibot(profileSchema));
		if (!phoneForm.valid) return fail(400, { phoneForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, phone } = phoneForm.data;
		const targets = await db
			.select({ userId: table.profile.userId })
			.from(table.profile)
			.where(eq(table.profile.id, id))
			.limit(1);
		const targetUserId = targets[0]?.userId;
		if (!(isAdmin(viewer) || viewer.id === targetUserId)) return fail(403, { phoneForm });

		await db
			.update(table.profile)
			.set({ phone: phone ?? null })
			.where(eq(table.profile.id, id));
		setFlash({ type: 'success', message: 'Phone updated.' }, event.cookies);
	},
	bio: async (event) => {
		const bioForm = await superValidate(event.request, valibot(profileSchema));
		if (!bioForm.valid) return fail(400, { bioForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, bio } = bioForm.data;
		const targets = await db
			.select({ userId: table.profile.userId })
			.from(table.profile)
			.where(eq(table.profile.id, id))
			.limit(1);
		const targetUserId = targets[0]?.userId;
		if (!(isAdmin(viewer) || viewer.id === targetUserId)) return fail(403, { bioForm });

		await db
			.update(table.profile)
			.set({ bio: bio ?? null })
			.where(eq(table.profile.id, id));
		setFlash({ type: 'success', message: 'Bio updated.' }, event.cookies);
	}
};
