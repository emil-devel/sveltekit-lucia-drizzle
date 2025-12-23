import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import { loginSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import * as auth from '$lib/server/auth';
import { sanitizeFormData } from '$lib/server/sanitize';

export const load = (async (event) => {
	if (event.locals.authUser) throw redirect(302, '/');

	const form = await superValidate(valibot(loginSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, {
			trim: ['username'],
			lowercase: ['username']
		});
		const form = await superValidate(data, valibot(loginSchema));
		const { username, password } = form.data;

		if (!form.valid) return fail(400, { form });

		const result = await db.query.user.findFirst({ where: (u) => eq(u.username, username) });

		const user = result;
		if (!user) {
			return setError(form, 'username', 'User does not exist!');
		}
		if (!user.active) {
			return setError(
				form,
				'username',
				'Your account has not yet been unlocked! Please contact your administrator.'
			);
		}

		const validPassword = await verify(user.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return setError(form, 'password', 'Wrong password!');
		}

		try {
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, user.id);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (error) {
			console.error('Login error:', error);
			// Always return the form for superforms on error
			return fail(500, {
				form,
				message: 'An error has occurred while logging the user.',
				error: String(error)
			});
		}

		redirect(302, '/', { type: 'info', message: 'You successfully logged in.' }, event.cookies);
	}
};
