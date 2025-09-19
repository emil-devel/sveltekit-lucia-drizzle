import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.authUser) {
		return redirect(302, '/login');
	}
	return { authUser: event.locals.authUser };
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		redirect(
			302,
			'/',
			{ type: 'info', message: 'You have successfully logged out!' },
			event.cookies
		);
	}
};
