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
	boolean,
	date,
	optional
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

// Per-field schemas for user page partial updates
export const userIdSchema = object({ id: string() });
export const updatedAtSchema = object({ updatedAt: date() });
export const createdAtSchema = object({ createdAt: date() });
export const userNameSchema = object({
	id: string(),
	username: pipe(string(), minLength(2), regex(/^[a-zA-Z0-9_]+$/), trim(), toLowerCase())
});
export const userEmailSchema = object({
	id: string(),
	email: pipe(string(), email(), trim(), toLowerCase())
});
export const activeUserSchema = object({ id: string(), active: boolean() });
export const roleUserSchema = object({ id: string(), role: string() });

export const userSchema = object({
	id: string(),
	active: boolean(),
	role: string(),
	username: string(),
	updatedAt: date(),
	createdAt: date()
});

// Per-field schemas for profile page partial updates
export const profileAvatarSchema = object({ id: string(), avatar: optional(string()) });
export const profileFirstNameSchema = object({ id: string(), firstName: optional(string()) });
export const profileLastNameSchema = object({ id: string(), lastName: optional(string()) });
export const profilePhoneSchema = object({ id: string(), phone: optional(string()) });
export const profileBioSchema = object({ id: string(), bio: optional(string()) });

export const profileSchema = object({
	id: string(),
	name: string(),
	userId: string(),
	avatar: optional(string()),
	firstName: optional(string()),
	lastName: optional(string()),
	phone: optional(string()),
	bio: optional(string())
});
