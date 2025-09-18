import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
	return {
		authUser: event.locals.authUser,
		url: event.url.pathname
	};
}) satisfies LayoutServerLoad;
