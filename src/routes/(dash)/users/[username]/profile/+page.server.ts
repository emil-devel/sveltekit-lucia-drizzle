import type { Actions, PageServerLoad } from './$types';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { isAdmin, isSelf } from '$lib/permissions';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {
	profileAvatarSchema,
	profileFirstNameSchema,
	profileLastNameSchema,
	profilePhoneSchema,
	profileBioSchema
} from '$lib/valibot';
import { sanitizeFormData } from '$lib/server/sanitize';

export const load = (async (event) => {
	if (!event.locals.authUser) throw redirect(302, '/login');
	const getProfile = async (name: string) => {
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
			.where(eq(table.profile.name, name))
			.orderBy(asc(table.profile.id))
			.limit(1);
		const profile = profiles[0];
		if (!profile) throw redirect(302, '/users');
		// View policy: Users may view only their own profile; Admins may view any profile
		const viewer = event.locals.authUser;
		if (!viewer || !(isAdmin(viewer) || isSelf(viewer.id, profile.userId)))
			throw redirect(302, '/users');
		// Create forms
		const [avatarForm, firstNameForm, lastNameForm, phoneForm, bioForm] = await Promise.all([
			superValidate(
				{ id: profile.id, avatar: profile.avatar as string | undefined },
				valibot(profileAvatarSchema)
			),
			superValidate(
				{ id: profile.id, firstName: profile.firstName as string | undefined },
				valibot(profileFirstNameSchema)
			),
			superValidate(
				{ id: profile.id, lastName: profile.lastName as string | undefined },
				valibot(profileLastNameSchema)
			),
			superValidate(
				{ id: profile.id, phone: profile.phone as string | undefined },
				valibot(profilePhoneSchema)
			),
			superValidate(
				{ id: profile.id, bio: profile.bio as string | undefined },
				valibot(profileBioSchema)
			)
		]);

		return {
			id: profile.id,
			name: profile.name,
			userId: profile.userId,
			avatarForm,
			firstNameForm,
			lastNameForm,
			phoneForm,
			bioForm
		};
	};

	return await getProfile(event.params.username);
}) satisfies PageServerLoad;

export const actions: Actions = {
	avatar: async (event) => {
		const avatarForm = await superValidate(event.request, valibot(profileAvatarSchema));
		if (!avatarForm.valid) return fail(400, { avatarForm });
		const viewer = event.locals.authUser;
		if (!viewer) throw redirect(302, '/login');
		const { id } = avatarForm.data;
		const avatar = avatarForm.data.avatar === '' ? null : avatarForm.data.avatar;
		try {
			await db
				.update(table.profile)
				.set({ avatar })
				.where(and(eq(table.profile.id, id)));
		} catch (error) {
			return setFlash(
				{ type: 'error', message: error instanceof Error ? error.message : String(error) },
				event.cookies
			);
		}
		setFlash(
			{
				type: 'success',
				message: `Avatar ${avatarForm.data.avatar === '' ? 'deleted' : 'updated'}.`
			},
			event.cookies
		);
	},
	firstName: async (event) => {
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, {
			trim: ['firstName'],
			emptyToUndefined: ['firstName']
		});
		const firstNameForm = await superValidate(data, valibot(profileFirstNameSchema));
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
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, {
			trim: ['lastName'],
			emptyToUndefined: ['lastName']
		});
		const lastNameForm = await superValidate(data, valibot(profileLastNameSchema));
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
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, {
			trim: ['phone'],
			emptyToUndefined: ['phone']
		});
		const phoneForm = await superValidate(data, valibot(profilePhoneSchema));
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
