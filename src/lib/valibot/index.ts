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
	optional,
	enum_,
	maxLength
} from 'valibot';
// Keep role values in sync with $lib/permissions/ROLES and Prisma enum

export const loginSchema = object({
	username: pipe(string(), trim(), toLowerCase()),
	password: string()
});

export const registerSchema = pipe(
	object({
		username: pipe(
			string(),
			minLength(4, 'Username must be at least 4 characters long'),
			maxLength(12, 'Username must be at most 12 characters long'),
			trim(),
			// 1. Allowed characters only
			regex(
				/^[a-z0-9._]+$/,
				'Username can only contain lowercase letters, numbers, dots and underscores'
			),
			// 2. No consecutive dots or underscores anywhere
			regex(/^(?!.*[_.]{2}).*$/, 'Username cannot contain consecutive dots or underscores'),
			// 3. Cannot start with specific characters (split for tailored messages)
			regex(/^(?![0-9]).*$/, 'Username cannot start with a number'),
			regex(/^(?!_).*/, 'Username cannot start with an underscore'),
			regex(/^(?!\.).*/, 'Username cannot start with a dot'),
			toLowerCase()
		),
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
	username: pipe(
		string(),
		minLength(4, 'Username must be at least 4 characters long'),
		maxLength(12, 'Username must be at most 12 characters long'),
		trim(),
		// 1. Allowed characters only
		regex(
			/^[a-z0-9._]+$/,
			'Username can only contain lowercase letters, numbers, dots and underscores'
		),
		// 2. No consecutive dots or underscores anywhere
		regex(/^(?!.*[_.]{2}).*$/, 'Username cannot contain consecutive dots or underscores'),
		// 3. Cannot start with specific characters (split for tailored messages)
		regex(/^(?![0-9]).*$/, 'Username cannot start with a number'),
		regex(/^(?!_).*/, 'Username cannot start with an underscore'),
		regex(/^(?!\.).*/, 'Username cannot start with a dot'),
		toLowerCase()
	)
});
export const userEmailSchema = object({
	id: string(),
	email: pipe(string(), email(), trim(), toLowerCase())
});
export const activeUserSchema = object({ id: string(), active: boolean() });

// Build a Valibot-compatible enum object from the shared ROLES list
export const ROLE_ENUM = {
	USER: 'USER',
	REDACTEUR: 'REDACTEUR',
	ADMIN: 'ADMIN'
} as const;

export const roleUserSchema = object({ id: string(), role: enum_(ROLE_ENUM) });

// Per-field schemas for profile page partial updates
export const profileFirstNameSchema = object({
	id: string(),
	firstName: optional(
		pipe(
			string(),
			minLength(2, 'First name must be at least 2 characters long'),
			maxLength(50, 'First name must be at most 50 characters long'),
			trim(),
			// Start with capital, allow up to 3 parts separated by single spaces; allowed chars letters, apostrophe, hyphen
			regex(
				/^[A-Z][a-zA-Z]*(?:[ '-][A-Za-z][a-zA-Z]*){0,2}$/,
				'First name must start with a capital letter, have up to 3 words, and only contain letters, spaces, apostrophes or hyphens'
			),
			// No two consecutive capital letters anywhere (after initial)
			regex(/^(?!.*[A-Z]{2}).*$/, 'First name cannot contain consecutive capital letters'),
			// No space followed by hyphen
			regex(/^(?!.* -).*$/, 'First name cannot contain space followed by hyphen'),
			// No space followed by apostrophe
			regex(/^(?!.* ').*$/, 'First name cannot contain space followed by apostrophe'),
			// No double spaces
			regex(/^(?!.* {2}).*$/, 'First name cannot contain consecutive spaces'),
			// No double hyphen
			regex(/^(?!.*--).*$/, 'First name cannot contain consecutive hyphens'),
			// No double apostrophe
			regex(/^(?!.*'').*$/, 'First name cannot contain consecutive apostrophes'),
			// Not end with separator
			regex(/^(?!.*[-' ]$).*$/, 'First name cannot end with a space, apostrophe or hyphen'),
			// Not start with separator (redundant with base but explicit for message clarity)
			regex(/^(?![-' ]).*$/, 'First name cannot start with a space, apostrophe or hyphen')
		)
	)
});
export const profileLastNameSchema = object({
	id: string(),
	lastName: optional(
		pipe(
			string(),
			minLength(2),
			maxLength(20),
			trim(),
			// Base allowed pattern (single or multi-part)
			regex(
				/^[A-Z][a-zA-Z]*(?:[ '-][A-Za-z][a-zA-Z]*)*$/,
				'Last name must start with a capital letter and contain only letters, spaces, apostrophes or hyphens'
			),
			regex(/^(?!.*[A-Z]{2}).*$/, 'Last name cannot contain consecutive capital letters'),
			regex(/^(?!.* -).*$/, 'Last name cannot contain space followed by hyphen'),
			regex(/^(?!.* ').*$/, 'Last name cannot contain space followed by apostrophe'),
			regex(/^(?!.* {2}).*$/, 'Last name cannot contain consecutive spaces'),
			regex(/^(?!.*--).*$/, 'Last name cannot contain consecutive hyphens'),
			regex(/^(?!.*'').*$/, 'Last name cannot contain consecutive apostrophes'),
			regex(/^(?!.*[-' ]$).*$/, 'Last name cannot end with a space, apostrophe or hyphen'),
			regex(/^(?![-' ]).*$/, 'Last name cannot start with a space, apostrophe or hyphen')
		)
	)
});
export const profilePhoneSchema = object({
	id: string(),
	phone: optional(
		pipe(
			string(),
			trim(),
			// 1. Allowed characters: optional single leading +, then digits or spaces only (no brackets, dashes, dots)
			regex(
				/^\+?[0-9 ]+$/,
				'Phone number can only contain digits, spaces and an optional leading +'
			),
			// 2. Total significant digits (remove spaces) must be 7–15
			check((v) => {
				const digits = v.replace(/[^0-9]/g, '');
				return digits.length >= 7 && digits.length <= 15;
			}, 'Phone number must contain between 7 and 15 digits')
		)
	)
});
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

// Display-only avatar schema (no phone/bio/name grouping needed on username page)
export const profileAvatarSchema = object({ id: string(), avatar: optional(string()) });
