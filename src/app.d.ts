// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface Locals {
			authUser: import('$lib/server/auth').SessionValidationResult['authUser'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
