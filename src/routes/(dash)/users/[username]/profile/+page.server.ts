import type { Actions, PageServerLoad } from './$types';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { isAdmin, isSelf } from '$lib/permissions';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';

import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {
	profileSchema,
	profileFirstNameSchema,
	profileLastNameSchema,
	profilePhoneSchema,
	profileBioSchema
} from '$lib/valibot';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');

	const getProfileForms = async (username: string) => {
		// Fetch profile by name = username
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
			.where(eq(table.profile.name, username))
			.orderBy(asc(table.profile.id))
			.limit(1);
		const row = profiles[0];
		if (!row) throw redirect(302, '/users');
		// View policy: Users may view only their own profile; Admins may view any profile
		const viewer = event.locals.authUser;
		if (!viewer || !(isAdmin(viewer) || isSelf(viewer.id, row.userId))) {
			throw redirect(302, '/users');
		}

		const profile = {
			...row,
			avatar: row.avatar ?? '',
			firstName: row.firstName ?? '',
			lastName: row.lastName ?? '',
			phone: row.phone ?? '',
			bio: row.bio ?? ''
		};

		const [profileForm, firstNameForm, lastNameForm, phoneForm, bioForm] = await Promise.all([
			superValidate(profile, valibot(profileSchema)),
			superValidate(
				{ id: profile.id, firstName: profile.firstName },
				valibot(profileFirstNameSchema)
			),
			superValidate({ id: profile.id, lastName: profile.lastName }, valibot(profileLastNameSchema)),
			superValidate({ id: profile.id, phone: profile.phone }, valibot(profilePhoneSchema)),
			superValidate({ id: profile.id, bio: profile.bio }, valibot(profileBioSchema))
		]);

		return { profileForm, firstNameForm, lastNameForm, phoneForm, bioForm };
	};

	return { form: await getProfileForms(event.params.username) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	firstName: async (event) => {
		const firstNameForm = await superValidate(event.request, valibot(profileFirstNameSchema));
		if (!firstNameForm.valid) return fail(400, { firstNameForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, firstName } = firstNameForm.data;

		try {
			await db
				.update(table.profile)
				.set({ firstName: firstName ?? null })
				.where(and(eq(table.profile.id, id), eq(table.profile.userId, viewer.id)))
				.returning({ id: table.profile.id });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: 'First name updated.' }, event.cookies);
	},
	lastName: async (event) => {
		const lastNameForm = await superValidate(event.request, valibot(profileLastNameSchema));
		if (!lastNameForm.valid) return fail(400, { lastNameForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, lastName } = lastNameForm.data;

		try {
			await db
				.update(table.profile)
				.set({ lastName: lastName ?? null })
				.where(and(eq(table.profile.id, id), eq(table.profile.userId, viewer.id)))
				.returning({ id: table.profile.id });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: 'Last name updated.' }, event.cookies);
	},
	phone: async (event) => {
		const phoneForm = await superValidate(event.request, valibot(profilePhoneSchema));
		if (!phoneForm.valid) return fail(400, { phoneForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, phone } = phoneForm.data;

		try {
			await db
				.update(table.profile)
				.set({ phone: phone ?? null })
				.where(and(eq(table.profile.id, id), eq(table.profile.userId, viewer.id)))
				.returning({ id: table.profile.id });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: 'Phone updated.' }, event.cookies);
	},
	bio: async (event) => {
		const bioForm = await superValidate(event.request, valibot(profileBioSchema));
		if (!bioForm.valid) return fail(400, { bioForm });

		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');

		const { id, bio } = bioForm.data;

		try {
			await db
				.update(table.profile)
				.set({ bio: bio ?? null })
				.where(and(eq(table.profile.id, id), eq(table.profile.userId, viewer.id)))
				.returning({ id: table.profile.id });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return setFlash({ type: 'error', message }, event.cookies);
		}

		setFlash({ type: 'success', message: 'Bio updated.' }, event.cookies);
	}
};
