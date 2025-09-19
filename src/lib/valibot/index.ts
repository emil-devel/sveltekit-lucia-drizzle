import {
	object,
	string,
	pipe,
	minLength,
	regex,
	toLowerCase,
	trim,
	email,
	check,
	boolean
} from 'valibot';

export const loginSchema = object({
	username: pipe(string(), trim(), toLowerCase()),
	password: string()
});

export const registerSchema = pipe(
	object({
		username: pipe(string(), minLength(2), regex(/^[a-zA-Z0-9_]+$/), trim(), toLowerCase()),
		email: pipe(string(), email(), trim(), toLowerCase()),
		password: pipe(
			string(),
			minLength(8, 'Password must be at least 8 characters long'),
			regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
			regex(/[a-z]/, 'Password must contain at least one lowercase letter'),
			regex(/[0-9]/, 'Password must contain at least one number'),
			regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
		),
		passwordConfirm: string()
	}),
	check((c) => c.passwordConfirm === c.password, 'Passwords dont match')
);

export const activeUserSchema = object({
	id: string(),
	active: boolean()
});

export const roleUserSchema = object({
	id: string(),
	role: string()
});
