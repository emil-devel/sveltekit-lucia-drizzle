import type { Actions, PageServerLoad } from './$types';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { hash } from '@node-rs/argon2';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import { registerSchema } from '$lib/valibot';
import { valibot } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sanitizeFormData } from '$lib/server/sanitize';

export const load = (async (event) => {
	if (event.locals.authUser) throw redirect(302, '/');

	const form = await superValidate(valibot(registerSchema));
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = sanitizeFormData(formData, {
			trim: ['username', 'email'],
			lowercase: ['username', 'email']
		});
		const form = await superValidate(data, valibot(registerSchema));
		const { username, email, password } = form.data;

		if (!form.valid) return fail(400, { form });
		if (form.data.passwordConfirm !== form.data.password) {
			return setError(form, 'passwordConfirm', 'Passwords dont match');
		}

		const userExists = await db.query.user.findFirst({ where: (u) => eq(u.username, username) });
		if (userExists) return setError(form, 'username', 'Username already exist!');

		const emailExist = await db.query.user.findFirst({ where: (u) => eq(u.email, email) });
		if (emailExist) return setError(form, 'email', 'Email already in use!');

		const id = generateUserId();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const totalUsers = await db.$count(table.user);
		const isFirstUser = totalUsers === 0;

		const userInsert = isFirstUser
			? { id, username, email, passwordHash, role: 'ADMIN' as const, active: true as boolean }
			: { id, username, email, passwordHash };

		try {
			await db.transaction(async (tx) => {
				await tx.insert(table.user).values(userInsert);
				await tx.insert(table.profile).values({ userId: id, name: username });
			});
		} catch (error) {
			return fail(500, {
				message: 'An error has occurred while creating the user.',
				error: String(error)
			});
		}

		redirect(
			'/login',
			{ type: 'success', message: 'You are now registered and can log in.' },
			event.cookies
		);
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
